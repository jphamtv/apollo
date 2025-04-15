import { Response, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import {
  create,
  findById,
  update,
  addParticipant,
  removeParticipant,
  findConversationsByUserId,
  findExistingConversationByParticipants,
  deleteById,
  markConversationAsRead,
} from '../models/conversationModel';
import { create as createMessage } from '../models/messageModel';
import { AuthRequest } from '../types';
import { UserWithBotDetails } from '../types/user/base';
import { notifyMessageRead } from '../services/socketService';
import { logger } from '../utils/logger';

const validateGroupName = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Group name must be between 1 and 50 characters')
    .matches(/^[\p{L}\p{N}\p{P}\p{Z}]+$/u)
    .withMessage(
      'Group name can contain letters, numbers, spaces and punctuation'
    ),
];

export const createConversation = [
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, isGroup, participantIds } = req.body;

      // Include the creator in participant check
      const allParticipantIds = [req.user.id, ...participantIds];

      const existingConversation =
        await findExistingConversationByParticipants(allParticipantIds);
      if (existingConversation) {
        return res.json({ conversation: existingConversation });
      }

      // Create new if none exists, add creator automatically
      const data = {
        name,
        isGroup,
        participants: {
          create: [
            { userId: req.user.id }, // Creator
            ...participantIds.map((id: string) => ({ userId: id })),
          ],
        },
      };

      const conversation = await create(data);

      // Check if any participant is a bot
      const botParticipant = conversation.participants.find(
        p => p.user.isBot === true && p.user.id !== req.user.id
      ) as { user: UserWithBotDetails } | undefined;

      // If this is a new conversation with a bot and it has an initial message, create it
      if (botParticipant && botParticipant.user.botInitialMessage) {
        // Add a small delay to make it feel more natural
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create the bot's initial message - only once per conversation
        await createMessage({
          text: botParticipant.user.botInitialMessage,
          conversation: { connect: { id: conversation.id } },
          sender: { connect: { id: botParticipant.user.id } },
        });

        // Refresh the conversation to include the new message
        const updatedConversation = await findById(conversation.id);
        return res.json({ conversation: updatedConversation });
      }

      res.json({ conversation });
    } catch (err) {
      logger.error(`Create conversation error: ${err}`);
      res.status(500).json({ message: 'Error creating conversation' });
    }
  },
] as unknown as RequestHandler[];

export const getUserConversations = [
  async (req: AuthRequest, res: Response) => {
    try {
      const conversations = await findConversationsByUserId(req.user.id);

      if (!conversations) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: "User's conversations not found",
        });
      }

      res.json(conversations);
    } catch (err) {
      logger.error(`Fetching error: ${err}`);
      res.status(500).json({
        error: 'SERVER_ERROR',
        message: "Error getting user's conversations",
      });
    }
  },
] as unknown as RequestHandler[];

export const getConversationById = [
  async (req: AuthRequest, res: Response) => {
    try {
      const conversation = await findById(req.params.id);

      if (!conversation) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      if (!conversation.participants.some(p => p.userId === req.user.id)) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Not authorized to view this conversation',
        });
      }

      res.json(conversation);
    } catch (err) {
      logger.error(`Fetching error: ${err}`);
      res.status(500).json({
        error: 'SERVER_ERROR',
        message: 'Error getting conversation',
      });
    }
  },
] as unknown as RequestHandler[];

export const updateGroupName = [
  ...validateGroupName,
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const conversationId = req.params.id;
      const conversation = await findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      if (!conversation.participants.some(p => p.userId === req.user.id)) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: "Not authorized to update this conversation's name",
        });
      }

      const { name } = req.body;

      const data = {
        name: conversation.isGroup ? name : undefined,
      };

      const updatedConversation = await update(conversationId, data);
      res.json(updatedConversation);
    } catch (err) {
      logger.error(`Update error: ${err}`);
      res.status(500).json({
        error: 'SERVER_ERROR',
        message: 'Error updating conversation name',
      });
    }
  },
] as RequestHandler[];

export const addParticipantToGroup = [
  async (req: AuthRequest, res: Response) => {
    try {
      const conversationId = req.params.id;
      const participantId = req.body.participantId;
      const conversation = await findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      if (!conversation.participants.some(p => p.userId === req.user.id)) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Not authorized to add participant to this conversation',
        });
      }

      if (!conversation.isGroup) {
        return res
          .status(404)
          .json({ message: 'Conversation is not a group chat' });
      }

      if (conversation.participants.some(p => p.userId === participantId)) {
        return res.status(400).json({
          message: 'Participant is already in the group chat',
        });
      }

      const updatedConversation = await addParticipant(
        conversationId,
        participantId
      );
      res.json(updatedConversation);
    } catch (err) {
      logger.error(`Add participant error: ${err}`);
      res.status(500).json({
        error: 'SERVER_ERROR',
        message: 'Error adding participant to conversation',
      });
    }
  },
] as unknown as RequestHandler[];

export const removeParticipantFromGroup = [
  async (req: AuthRequest, res: Response) => {
    try {
      const conversationId = req.params.id;
      const participantId = req.body.participantId;
      const conversation = await findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      if (!conversation.participants.some(p => p.userId === req.user.id)) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message:
            'Not authorized to remove participant from this conversation',
        });
      }

      if (!conversation.isGroup) {
        return res
          .status(404)
          .json({ message: 'Conversation is not a group chat' });
      }

      const updatedConversation = await removeParticipant(
        conversationId,
        participantId
      );
      res.json(updatedConversation);
    } catch (err) {
      logger.error(`Remove participant error: ${err}`);
      res.status(500).json({
        error: 'SERVER_ERROR',
        message: 'Error removing participant from conversation',
      });
    }
  },
] as unknown as RequestHandler[];

export const deleteConversation = [
  async (req: AuthRequest, res: Response) => {
    try {
      const conversation = await findById(req.params.id);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      if (!conversation.participants.some(p => p.userId === req.user.id)) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Not authorized to delete this conversation',
        });
      }

      await deleteById(req.params.id);
      res.json({ message: 'Conversation deleted successfully' });
    } catch (err) {
      logger.error(`Delete error: ${err}`);
      res.status(500).json({
        error: 'SERVER_ERROR',
        message: 'Error deleting conversation',
      });
    }
  },
] as unknown as RequestHandler[];

export const markAsRead = [
  async (req: AuthRequest, res: Response) => {
    try {
      const conversationId = req.params.id;
      const userId = req.user.id;

      // First check if the user is a participant
      const conversation = await findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const isParticipant = conversation.participants.some(
        p => p.userId === userId
      );
      if (!isParticipant) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Not authorized to access this conversation',
        });
      }

      // Mark all messages as read
      const updatedCount = await markConversationAsRead(conversationId, userId);

      // Notify message was read
      notifyMessageRead(conversationId, userId);

      res.json({ updated: updatedCount });
    } catch (err) {
      logger.error(`Mark conversation as read error: ${err}`);
      res.status(500).json({ message: 'Error marking conversation as read' });
    }
  },
] as unknown as RequestHandler[];

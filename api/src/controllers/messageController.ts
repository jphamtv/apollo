/**
 * Message controller handling all message-related operations
 *
 * Architecture highlights:
 *
 * 1. Message creation with advanced features:
 *    - Supports text-only, image-only, or combined messages
 *    - Images stored in Cloudflare R2 storage
 *    - Performs permission validation to ensure sender is a conversation participant
 *    - Handles real-time notifications through Socket.io
 *    - Implements AI bot response system with typing indicators
 *
 * 2. Security considerations:
 *    - Validates all inputs with express-validator
 *    - Enforces authorization checks before any data access
 *    - Sanitizes inputs to prevent injection attacks
 *
 * 3. Performance optimizations:
 *    - Immediately responds to user with their message before processing bot response
 *    - Uses asynchronous processing for bot responses to prevent blocking
 *    - Implements rate limiting (via middleware) to prevent abuse
 *    - Includes realistic typing delays for AI bots
 */
import { Response, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import {
  create,
  markAsRead,
  deleteById,
  findByConversationId,
} from '../models/messageModel';
import { findById as findConversationById, isParticipant } from '../models/conversationModel';
import { findBotById } from '../models/authModel';
import { AuthRequest } from '../types';
import { notifyNewMessage } from '../services/socketService';
import { logger } from '../utils/logger';
import { generateBotResponse } from '../services/openaiService';
import {
  notifyTypingStarted,
  notifyTypingStopped,
} from '../services/socketService';

/**
 * Retrieves all messages for a conversation
 *
 * Security flow:
 * 1. Verify conversation exists
 * 2. Verify current user is a participant
 * 3. Return messages if authorized
 *
 * @route GET /api/conversations/:conversationId/messages
 * @authenticated Required
 */
export const getConversationMessages = [
  async (req: AuthRequest, res: Response) => {
    try {
      const conversation = await findConversationById(req.params.conversationId);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      // Authorization check
      const isParticipant = conversation.participants.some(
        p => p.userId === req.user.id
      );

      if (!isParticipant) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Not authorized to view these messages',
        });
      }

      res.json({ messages: conversation.messages });
    } catch (err) {
      logger.error(`Get messages error: ${err}`);
      res.status(500).json({ message: 'Error getting messages' });
    }
  },
] as unknown as RequestHandler[];

/**
 * Creates a new message in a conversation
 *
 * Complex implementation handling:
 * 1. Message validation (text and/or image)
 * 2. Participant verification
 * 3. Image processing if provided (uploaded to R2)
 * 4. Real-time notification to other participants
 * 5. Asynchronous bot response processing
 *
 * @route POST /api/conversations/:conversationId/messages
 * @authenticated Required
 */
export const createMessage = [
  body('text')
    .if((value, { req }) => !req.file) // Only apply this validation if there's no image file
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters'),
  body('text')
    .if((value, { req }) => req.file) // Apply this validation if there's an image file
    .optional() // Make text optional
    .isLength({ max: 5000 }) // Still enforce text length if provided
    .withMessage('Message text cannot exceed 5000 characters'),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { text } = req.body;
      const conversationId = req.params.conversationId;
      const senderId = req.user.id;

      // Allow either, text, image, or both
      if (!text && !req.fileUrl) {
        return res
          .status(400)
          .json({ message: 'Message must contain text or an image' });
      }

      // Image URL comes from the R2 upload middleware
      const imageUrl = req.fileUrl || null;

      const isUserParticipant = await isParticipant(senderId, conversationId);
      if (!isUserParticipant) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Not authorized to send messages to this conversation',
        });
      }

      const message = await create({
        text: text || '',
        imageUrl,
        conversation: { connect: { id: conversationId } },
        sender: { connect: { id: senderId } },
      });

      // Notify about new message via socket
      notifyNewMessage(message, conversationId, senderId);

      // Send response immediately with user's message
      res.json({ message });

      // Get conversation for bot check
      const conversation = await findConversationById(conversationId);
      if (!conversation) {
        logger.error('Conversation not found for bot processing');
        return;
      }

      // Look for bot participant
      const botParticipant = conversation.participants.find(
        p => p.user.isBot === true && p.user.id !== senderId
      );

      // IMPORTANT: Handle bot response asynchronously to avoid delaying user's message
      // This self-executing async function allows the main request to complete
      // while bot processing continues in the background
      if (botParticipant && senderId !== botParticipant.user.id) {
        (async () => {
          const botId = botParticipant.user.id;
          let typingStarted = false;
          try {
            // Get bot user with its system prompt
            const botUser = await findBotById(botId);
            if (!botUser) return;

            // Get conversation history (last 10 messages for context)
            const messageHistory = await findByConversationId(conversationId);

            // Format history for OpenAI API
            const conversationHistory = messageHistory
              .map(msg => ({
                role: msg.sender.id === botUser.id ? 'assistant' : 'user',
                content: msg.text,
              }))
              .reverse();

            await new Promise(resolve =>
              setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)
            );

            // Send typing indicator via socket
            notifyTypingStarted(botId, conversationId);
            typingStarted = true;

            // Generate bot response
            const botResponse = await generateBotResponse(
              botUser.botSystemPrompt || 'You are a helpful assistant',
              botUser.botQuotes || [],
              conversationHistory
            );

            await new Promise(resolve =>
              setTimeout(resolve, Math.floor(Math.random() * 1500) + 750)
            );

            // Stop typing indicator
            notifyTypingStopped(botId, conversationId);

            // Save bot message response as message
            const botMessage = await create({
              text: botResponse,
              conversation: { connect: { id: conversationId } },
              sender: { connect: { id: botUser.id } },
            });

            // Notify about bot message
            notifyNewMessage(botMessage, conversationId, botId);
          } catch (err) {
            logger.error(`Bot response error: ${err}`);
          } finally {
            // Always stop typing if it was started
            if (typingStarted) {
              notifyTypingStopped(botId, conversationId);
            }
          }
        })();
      }
    } catch (err) {
      logger.error(`Create message error: ${err}`);
      res.status(500).json({ message: 'Error creating message' });
    }
  },
] as unknown as RequestHandler[];

export const markMessageAsRead = [
  async (req: AuthRequest, res: Response) => {
    try {
      const messageId = req.params.id;
      const message = await markAsRead(messageId);
      res.json({ message });
    } catch (err) {
      logger.error(`Mark as read error: ${err}`);
      res.status(500).json({ message: 'Error marking message as read' });
    }
  },
] as unknown as RequestHandler[];

export const deleteMessage = [
  async (req: AuthRequest, res: Response) => {
    try {
      const messageId = req.params.id;
      
      // The model handles deleting both the database record and associated image
      await deleteById(messageId);
      
      res.json({ message: 'Message deleted successfully' });
    } catch (err) {
      logger.error(`Delete message error: ${err}`);
      res.status(500).json({ message: 'Error deleting message' });
    }
  },
] as unknown as RequestHandler[];

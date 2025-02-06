import { Response, RequestHandler } from "express";
import { body, validationResult } from "express-validator";
import {
  create,
  findById as findMessageById,
  markAsRead,
  deleteById,
} from "../models/messageModel";
import { isParticipant, findById as findConversationById } from "../models/conversationModel";
import { AuthRequest, MessageResponse, MessageWithDetails } from "../types";

const validateMessage = [
  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message must contain at least 1 character")
    .matches(/^[\p{L}\p{N}\p{P}\p{Z}\p{Emoji}\p{Emoji_Component}]+$/u)
    .withMessage("Message can contain text, numbers, emojis, and punctuation"),
];

const toMessageResponse = (message: MessageWithDetails): MessageResponse => {
  return {
    id: message.id,
    text: message.text,
    conversationId: message.conversationId,
    isRead: message.isRead,
    createdAt: message.createdAt,
    sender: {
      id: message.sender.id,
      username: message.sender.username
    }
  };
};

export const createMessage = [
  ...validateMessage,
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const conversationId = req.params.id;
      const senderId = req.user.id;

      const conversation = await findById(conversationId);
        if (!conversation) {
          return res.status(404).json({ 
            error: "NOT_FOUND",
            message: "Conversation not found" 
          });}

      if (!(await isParticipant(senderId, conversationId))) {
        return res.status(403).json({
          error: "FORBIDDEN",
          message: "Not a participant in this conversation"
        });
      }

      const { text } = req.body;  

      const data = {
        text,
        conversation: {
          connect: { id: conversationId }
        },
        sender: {
          connect: { id: senderId }
        }
      };

      const message: MessageWithDetails = await create(data);
      res.json(toMessageResponse(message));
    } catch (err) {
      console.error("Create message error: ", err);
      res.status(500).json({ message: "Error creating message" });
    }
  }
] as unknown as RequestHandler[];

export const markMessageAsRead = [
  async (req: AuthRequest, res: Response) => {
    try {
      const messageId = req.params.id;
      const message = await findMessageById(messageId);

      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      const updatedMessage = await markAsRead(messageId);
      res.json(toMessageResponse(updatedMessage));
    } catch (err) {
      console.error("Update error: ", err);
      res.status(500).json({
        error: "SERVER_ERROR",
        message: "Error updating message read status"
      });
    }
  }
] as unknown as RequestHandler[];

export const deleteMessage = [  
  async (req: AuthRequest, res: Response) => {
    try {
      const messageId = req.params.id;
      const message = await findMessageById(messageId);
  
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
  
      if (message.senderId !== req.user.id) {
        return res.status(403).json({
          error: "FORBIDDEN",
          message: "Not authorized to delete this message"
        });
      }
  
      await deleteById(messageId);
      res.json({ message: "Message deleted successfully" });
    } catch (err) {
      console.error("Delete error: ", err);
      res.status(500).json({
        error: "SERVER_ERROR",
        message: "Error deleting message"
      });
    }
  }
] as unknown as RequestHandler[];
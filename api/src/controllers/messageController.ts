import { Response, RequestHandler } from "express";
import { body, validationResult } from "express-validator";
import {
  create,
  markAsRead,
  deleteById,
} from "../models/messageModel";
import { findById } from "../models/conversationModel";
import { AuthRequest } from "../types";

export const getConversationMessages = [
  async (req: AuthRequest, res: Response) => {
    try {
      const messages = await findById(req.params.conversationId);
      res.json({ messages });
    } catch (err) {
      console.error('Get messages error:', err);
      res.status(500).json({ message: 'Error getting messages' });
    }
  }
] as unknown as RequestHandler[];

export const createMessage = [
  body("text")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { text } = req.body;
      const conversationId = req.params.conversationId;
      const senderId = req.user.id;

      const message = await create({
        text,
        conversation: { connect: { id: conversationId } },
        sender: { connect: { id: senderId } }
      });

      res.json({ message });
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
      const message = await markAsRead(messageId);
      res.json({ message });
    } catch (err) {
      console.error("Mark as read error: ", err);
      res.status(500).json({ message: "Error marking message as read" });
    }
  }
] as unknown as RequestHandler[];

export const deleteMessage = [
  async (req: AuthRequest, res: Response) => {
    try {
      const messageId = req.params.id;
      await deleteById(messageId);
      res.json({ message: "Message deleted successfully" });
    } catch (err) {
      console.error("Delete message error: ", err);
      res.status(500).json({ message: "Error deleting message" });
    }
  }
] as unknown as RequestHandler[];
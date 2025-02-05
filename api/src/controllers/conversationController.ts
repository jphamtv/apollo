import { Request, Response, RequestHandler } from "express";
import { body, validationResult } from "express-validator";
import {
  create,
  findAllByUserId,
  findById,
  update,
  addParticipant,
  removeParticipant,
  findConversationsWithLatestMessage,
  deleteConversation,
} from "../models/conversationModel";
import { AuthRequest } from "../types";

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { name, isGroup, participantIds } = req.body;  

    // Add creator automatically
    const data = {
      name,
      isGroup,
      participants: {
        create: [
          { userId: req.user.id }, // Creator
          ...participantIds.map((id: string) => ({ userId: id }))
        ]
      }
    };

    const conversation = await create(data);
    res.json(conversation);
  } catch (err) {
    console.error("Create conversation error: ", err);
    res.status(500).json({ message: "Error creating conversation" });
  }
};

export const getAllConversationPreviews = async (req: AuthRequest, res: Response) => {
  try {
    const conversationPreviews = await findAllByUserId(req.user.id);

    if (!conversationPreviews) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "User's conversation previews not found"
      });
    }

    res.json(conversationPreviews);
  } catch (err) {
    console.error("Fetching error: ", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error getting user's conversation previews"
    });
  }
};

export const getConversationById = async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Conversation not found"
      });
    }

    if (!conversation.participants.some(p => p.userId === req.user.id)) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Not a participant in this conversation"
      });
    }

    res.json(conversation);
  } catch (err) {
    console.error("Fetching error: ", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error getting conversation"
    });
  }
};

// Update conversation (for group name changes)
export const updateConversation = async (req: AuthRequest, res: Response) => {
  // ...
};

// Add participant (for group chats)
export const addParticipantToConversation = async (req: AuthRequest, res: Response) => {
  // ...
};

// Remove participant (for group chats)
export const removeParticipantFromConversation = async (req: AuthRequest, res: Response) => {
  // ...
};

// Delete conversation
export const deleteConversation = async (req: AuthRequest, res: Response) => {
  // ...
};
import { Request, Response, RequestHandler } from "express";
import { body, validationResult } from "express-validator";
import {
  create,
  findById,
  update,
  addParticipant,
  removeParticipant,
  findConversationsByUserId,
  deleteById,
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

export const getUserConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await findConversationsByUserId(req.user.id);

    if (!conversations) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "User's conversations not found"
      });
    }

    res.json(conversations);
  } catch (err) {
    console.error("Fetching error: ", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error getting user's conversations"
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
        message: "Not authorized to view this conversation"
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

export const updateGroupConversationName = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = req.params.id;
    const conversation = await findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some(p => p.userId === req.user.id)) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Not authorized to update this conversation's name"
      });
    }

    const { name } = req.body;  

    const data = {
      name: conversation.isGroup ? name : undefined
    }

    const updatedConversation = await update(conversationId, data);
    res.json(updatedConversation);
  } catch (err) {
    console.error("Update error: ", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error updating conversation name"
    });
  }
};

export const addParticipantToConversation = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = req.params.id;
    const participantId = req.body.participantId;
    const conversation = await findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    if (!conversation.participants.some(p => p.userId === req.user.id)) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Not authorized to add participant to this conversation"
      });
    }

    if (!conversation.isGroup) {
      return res.status(404).json({ message: "Conversation is not a group chat" });
    }

    if (conversation.participants.some(p => p.userId === participantId)) {
      return res.status(400).json({
        message: "Participant is already in the group chat"
      });
    }

    const updatedConversation = await addParticipant(conversationId, participantId);
    res.json(updatedConversation);
  } catch (err) {
    console.error("Add participant error: ", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error adding participant to conversation"
    });
  }
};

export const removeParticipantFromConversation = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = req.params.id;
    const participantId = req.body.participantId;
    const conversation = await findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some(p => p.userId === req.user.id)) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Not authorized to remove participant from this conversation"
      });
    }

    if (!conversation.isGroup) {
      return res.status(404).json({ message: "Conversation is not a group chat" });
    }

    const updatedConversation = await removeParticipant(conversationId, participantId);
    res.json(updatedConversation);
  } catch (err) {
    console.error("Remove participant error: ", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error removing participant from conversation"
    });
  }
};

export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some(p => p.userId === req.user.id)) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Not authorized to delete this conversation"
      });
    }

    await deleteById(req.params.id);
    res.json({ message: "Conversation deleted successfully" });
  } catch (err) {
    console.error("Delete error: ", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error deleting conversation"
    });
  }
};
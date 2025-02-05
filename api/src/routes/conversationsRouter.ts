import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware";
import {
  createConversation,
  getUserConversations,
  getConversationById,
  updateGroupName,
  addParticipantToGroup,
  removeParticipantFromGroup,
  deleteConversation,
} from "../controllers/conversationController";

const router = express.Router();

// Main conversation routes
router.post("/", authenticateJWT, createConversation);
router.get("/", authenticateJWT, getUserConversations);
router.get(":id", authenticateJWT, getConversationById);
router.put("/:id", authenticateJWT, updateGroupName);
router.delete("/:id", authenticateJWT, deleteConversation);

// Participant management
router.post("/:id/participants", authenticateJWT, addParticipantToGroup);
router.delete("/:id/participants/:userId", authenticateJWT, removeParticipantFromGroup);

export default router;

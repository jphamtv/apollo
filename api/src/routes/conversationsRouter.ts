import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

// Main conversation routes
router.post("/", authenticateJWT, createConversation);
router.get("/", authenticateJWT, getAllConversationPreviews);
router.get(":id", authenticateJWT, getConversationById);
router.put("/:id", authenticateJWT, updateConversation);
router.delete("/:id", authenticateJWT, deleteConversation);

// Participant management
router.post("/:id/participants", authenticateJWT, addParticipantToConversation);
router.delete("/:id/participants/:userId", authenticateJWT, removeParticipantFromConversation);

export default router;

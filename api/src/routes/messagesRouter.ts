import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware";
import { generalLimiter } from "../middleware/rateLimitMiddleware";
import {
  createMessage,
  markMessageAsRead,
  deleteMessage,
  getConversationMessages
} from "../controllers/messageController";

const router = express.Router();

router.get("/:conversationId/messages", authenticateJWT, getConversationMessages);
router.post("/:conversationId/messages", generalLimiter, authenticateJWT, createMessage);
router.put("/:conversationId/messages/:id", authenticateJWT, markMessageAsRead);
router.delete("/:conversationId/messages/:id", authenticateJWT, deleteMessage);

export default router;
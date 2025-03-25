import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
  createConversation,
  getUserConversations,
  getConversationById,
  updateGroupName,
  addParticipantToGroup,
  removeParticipantFromGroup,
  deleteConversation,
  markAsRead,
} from '../controllers/conversationController';

const router = express.Router();

// Main conversation routes
router.post('/', authenticateJWT, createConversation);
router.get('/', authenticateJWT, getUserConversations);
router.get('/:id', authenticateJWT, getConversationById);
router.put('/:id', authenticateJWT, updateGroupName);
router.put('/:id/read', authenticateJWT, markAsRead);
router.delete('/:id', authenticateJWT, deleteConversation);

// Participant management
router.post('/:id/participants', authenticateJWT, addParticipantToGroup);
router.delete(
  '/:id/participants/:userId',
  authenticateJWT,
  removeParticipantFromGroup
);

export default router;

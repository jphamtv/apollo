import express, { Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { generalLimiter } from '../middleware/rateLimitMiddleware';
import {
  createMessage,
  markMessageAsRead,
  deleteMessage,
  getConversationMessages,
} from '../controllers/messageController';
import { uploadMessageImage as uploadMessageImageMiddleware } from '../middleware/fileUploadMiddleware';

const router = express.Router({ mergeParams: true });

router.get('/', authenticateJWT, getConversationMessages);
router.post(
  '/',
  generalLimiter,
  authenticateJWT,
  uploadMessageImageMiddleware,
  createMessage
);
router.put('/:id', authenticateJWT, markMessageAsRead);
router.delete('/:id', authenticateJWT, deleteMessage);

export default router;

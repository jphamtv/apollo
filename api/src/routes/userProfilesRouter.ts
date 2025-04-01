import express, { Request, Response, NextFunction } from 'express';
import {
  getUserProfile,
  searchUsers,
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
} from '../controllers/userProfileController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { generalLimiter } from '../middleware/rateLimitMiddleware';
import { uploadProfileImage as uploadProfileImageMiddleware } from '../middleware/fileUploadMiddleware';

const router = express.Router();

router.get('/search', authenticateJWT, generalLimiter, searchUsers);
router.get(
  '/profile/:username',
  authenticateJWT,
  generalLimiter,
  getUserProfile
);
router.put('/profile', authenticateJWT, updateUserProfile);
router.post(
  '/profile/image',
  authenticateJWT,
  uploadProfileImageMiddleware,
  uploadProfileImage
);
router.delete('/profile/image', authenticateJWT, deleteProfileImage);

export default router;

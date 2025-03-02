import express, { Request, Response, NextFunction } from "express";
import {
  getUserProfile,
  searchUsers,
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
} from "../controllers/userProfileController";
import { authenticateJWT } from "../middleware/authMiddleware";
import { generalLimiter } from "../middleware/rateLimitMiddleware";
import { uploadUserProfileImage } from "../middleware/uploadMiddleware";

const router = express.Router();

router.get("/search", authenticateJWT, generalLimiter, searchUsers);
router.get("/profile/:username", authenticateJWT, generalLimiter, getUserProfile);
router.put("/profile", authenticateJWT, updateUserProfile);
router.post('/profile/image', authenticateJWT, (req: Request, res: Response, next: NextFunction) => {
  uploadUserProfileImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || 'Error uploading image'
      });
    }
    next();
  });
}, uploadProfileImage);
router.delete('/profile/delete', authenticateJWT, deleteProfileImage);

export default router;

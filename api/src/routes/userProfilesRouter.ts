import express, { RequestHandler } from "express";
import {
  getUserProfile,
  searchUsers,
  updateUserProfile,
} from "../controllers/userProfileController";
import { authenticateJWT } from "../middleware/authMiddleware";
import { generalLimiter } from "../middleware/rateLimitMiddleware";

const router = express.Router();

// Public routes
router.get("/:username", generalLimiter, getUserProfile);

// Protected routes
router.get("/search", authenticateJWT, generalLimiter, searchUsers);
router.put("/profile", authenticateJWT, updateUserProfile);

export default router;

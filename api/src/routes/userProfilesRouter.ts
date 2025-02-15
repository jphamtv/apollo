import express, { RequestHandler } from "express";
import {
  getUserProfile,
  searchUsers,
  updateUserProfile,
} from "../controllers/userProfileController";
import { authenticateJWT } from "../middleware/authMiddleware";
import { generalLimiter } from "../middleware/rateLimitMiddleware";

const router = express.Router();

router.get("/search", authenticateJWT, generalLimiter, searchUsers);
router.get("/profile/:username", authenticateJWT, generalLimiter, getUserProfile);
router.put("/profile", authenticateJWT, updateUserProfile);

export default router;

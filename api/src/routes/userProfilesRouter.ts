import express, { RequestHandler } from "express";
import { getUserProfile, updateUserProfile, } from "../controllers/userProfileController";
import { authenticateJWT } from "../middleware/authMiddleware";
import { generalLimiter } from "../middleware/rateLimitMiddleware";

const router = express.Router();

// Public routes
router.get("/:username", generalLimiter, getUserProfile as RequestHandler);

// Protected routes
router.put("/", authenticateJWT, updateUserProfile);

export default router;

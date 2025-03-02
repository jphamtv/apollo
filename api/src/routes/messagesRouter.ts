import express, { Request, Response, NextFunction } from "express";
import { authenticateJWT } from "../middleware/authMiddleware";
import { generalLimiter } from "../middleware/rateLimitMiddleware";
import {
  createMessage,
  markMessageAsRead,
  deleteMessage,
  getConversationMessages
} from "../controllers/messageController";
import { uploadMessageImage } from "../middleware/uploadMiddleware";

const router = express.Router();

router.get("/", authenticateJWT, getConversationMessages);
router.post('/', generalLimiter, authenticateJWT, (req: Request, res: Response, next: NextFunction) => {
  uploadMessageImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || 'Error uploading image'
      });
    }
    next();
  });
}, createMessage);
router.put("/:id", authenticateJWT, markMessageAsRead);
router.delete("/:id", authenticateJWT, deleteMessage);

export default router;
import express, { Request, Response, NextFunction, RequestHandler } from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
} from "../controllers/authController";
import { authenticateJWT } from "../middleware/authMiddleware";
import { requestReset, confirmReset, validateResetRequest, validateResetConfirm } from "../controllers/resetController";
import { User, AuthError, AuthRequest } from "../types/authTypes";
import { loginLimiter, registerLimiter, generalLimiter } from "../middleware/rateLimitMiddleware";

const router = express.Router();

// Public routes
router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: AuthError, user: User, info: { message: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(401)
          .json({ message: info.message || "Invalid credentials" });
      }

      // Attach user to request if successful
      const authReq = req as AuthRequest;
      authReq.user = user;

      // Call the login handler to generate token
      return loginUser(authReq, res);
    },
  )(req, res, next);
});

// Protected routes
router.get("/verify", authenticateJWT, verifyUser as unknown as RequestHandler);
router.get("/logout", authenticateJWT, logoutUser);

// Password reset routes
router.post("/reset-request", generalLimiter, validateResetRequest, requestReset as RequestHandler);
router.post("/reset-confirm", generalLimiter, validateResetConfirm, confirmReset as RequestHandler);

export default router;

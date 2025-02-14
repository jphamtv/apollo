import { Request, Response, RequestHandler } from "express";
import { body, validationResult } from "express-validator";
import { findByUsername, findByUserId, update } from "../models/userProfileModel";
import { AuthRequest } from "../types";

const validateUserProfile = [
  body("displayName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`Display name must between 2 and 50 characters`)
    .matches(/^[\p{L}\p{N}\p{P}\p{Z}\p{S}]+$/u)
    .withMessage("Display name can contain letters, numbers, spaces, and special characters"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(`Bio must not exceed 500 characters`),
  body("imageUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage(`Invalid image URL`),
];

export const updateUserProfile = [
  ...validateUserProfile,
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;      

      const existingProfile = await findByUserId(userId);

      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
     
      const { displayName, bio, imageUrl } = req.body;
      const userProfile = await update(userId, {
        displayName,
        bio,
        imageUrl
      });

      // Only send back safe user data
      const safeUser = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        profile: userProfile
      };
      
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ message: "Error updating user's profile" });
    }
  },
] as RequestHandler[];

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userProfile = await findByUsername(req.params.username);

    if (!userProfile) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "User's Profile not found"
      });
    }

    res.json(userProfile);
  } catch (err) {
    console.error("Fetching error: ", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error getting user's profile"
    });
  }
};

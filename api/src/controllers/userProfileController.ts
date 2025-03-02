import { Request, Response, RequestHandler } from "express";
import { body, validationResult } from "express-validator";
import { findByUsername, findByUserId, findByQuery, update } from "../models/userProfileModel";
import { AuthRequest } from "../types";
import { getFileUrl } from "../middleware/uploadMiddleware";
import fs from 'fs';
import path from 'path';

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
      res.status(500).json({ message: "Error updating profile" });
    }
  },
] as RequestHandler[];

export const getUserProfile = [
  async (req: Request, res: Response) => {
    try {
      const userProfile = await findByUsername(req.params.username);

      if (!userProfile) {
        return res.status(404).json({
          error: "NOT_FOUND",
          message: "Profile not found"
        });
      }

      res.json(userProfile);
    } catch (err) {
      console.error("Fetching error: ", err);
      res.status(500).json({
        error: "SERVER_ERROR",
        message: "Error getting profile"
      });
    }
  }
] as RequestHandler[];

export const searchUsers = [
  async (req: AuthRequest, res: Response) => {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    try {
      const users = await findByQuery(query, req.user.id);
      res.json({ users });
    } catch (error) {
      console.error('User search error:', error);
      res.status(500).json({ message: "Error searching users" });
    }
  }
] as unknown as RequestHandler[];

export const uploadProfileImage = [
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const userId = req.user.id;
      const existingProfile = await findByUserId(userId);

      if (!existingProfile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // Generate image URL
      const imageUrl = getFileUrl(req.file.filename, 'profile');

      // Delete old image file if it exists
      if (existingProfile.imageUrl) {
        try {
          const oldImagePath = existingProfile.imageUrl.split('/').pop();
          if (oldImagePath) {
            const fullPath = path.join(__dirname, '../../uploads/profiles', oldImagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        } catch (err) {
          console.error('Error deleting old image: ', err);
        }
      }

      // Update profile with new image URL
      const userProfile = await update(userId, { imageUrl });

      // Return updated user data
      const safeUser = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        profile: userProfile
      };

      res.json({ user: safeUser });
    } catch (err) {
      console.error('Upload error: ', err);
      res.status(500).json({ message: 'Error uploading profile image' });
    }
  }
] as unknown as RequestHandler[];

export const deleteProfileImage = [
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.id;
      const existingProfile = await findByUserId(userId);

      if (!existingProfile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // If there's an existing image, delete the file
      if (existingProfile.imageUrl) {
        try {
          const oldImagePath = existingProfile.imageUrl.split('/').pop();
          if (oldImagePath) {
            const fullPath = path.join(__dirname, '../../uploads/profiles', oldImagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        } catch (err) {
          console.error('Error deleting image file: ', err);
        }
      }

      // Update profile to remove image URL
      const userProfile = await update(userId, { imageUrl: null });

      // Return updated user data
      const safeUser = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        profile: userProfile
      };

      res.json({ user: safeUser });
    } catch (err) {
      console.error('Delete image error: ', err);
      res.status(500).json({ message: 'Error deleting profile image' });
    }
  }
] as unknown as RequestHandler[];

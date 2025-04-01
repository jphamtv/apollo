import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadFile } from '../services/fileStorageService';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import path from 'path';

// Configure multer with memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Only image files are allowed'));
  }
};

// Create base multer instance with memory storage
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: imageFilter,
});

// Generate a unique filename
const generateUniqueFilename = (originalname: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  return `${timestamp}-${randomString}${extension}`;
};

// Middleware to handle profile image uploads
export const uploadProfileImage = (req: Request, res: Response, next: NextFunction) => {
  const singleUpload = upload.single('image');

  singleUpload(req, res, async (err) => {
    if (err) {
      logger.error(`Upload error: ${err.message}`);
      return res.status(400).json({ error: err.message });
    }

    // If no file was uploaded, continue to next middleware
    if (!req.file) {
      return next();
    }

    try {
      const file = req.file;
      const filename = generateUniqueFilename(file.originalname);
      const key = `profiles/${filename}`;

      // Upload to R2
      const result = await uploadFile(file.buffer, key, file.mimetype);

      // Add the file info to the request object
      req.fileUrl = result.url;
      req.fileKey = result.key;
      next();
    } catch (error) {
      logger.error(`R2 upload error: ${error}`);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
  });
};

// Middleware to handle message image uploads
export const uploadMessageImage = (req: Request, res: Response, next: NextFunction) => {
  const singleUpload = upload.single('image');

  singleUpload(req, res, async (err) => {
    if (err) {
      logger.error(`Upload error: ${err.message}`);
      return res.status(400).json({ error: err.message });
    }

    // If no file was uploaded, continue to next middleware
    if (!req.file) {
      return next();
    }

    try {
      const file = req.file;
      const filename = generateUniqueFilename(file.originalname);
      const key = `messages/${filename}`;

      // Upload to R2
      const result = await uploadFile(file.buffer, key, file.mimetype);

      // Add the file info to the request object
      req.fileUrl = result.url;
      req.fileKey = result.key;
      next();
    } catch (error) {
      logger.error(`R2 upload error: ${error}`);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
  });
};

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      fileUrl?: string;
      fileKey?: string;
    }
  }
}

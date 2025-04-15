import { Request, Response, NextFunction } from 'express';
import { uploadFile } from '../services/fileStorageService';
import { logger } from '../utils/logger';
import multer from 'multer';
import heicConvert from 'heic-convert';
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
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
  ];

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
    fileSize: 20 * 1024 * 1024, // 20MB max
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

// Convert HEIC to JPEG if needed
async function convertHeicIfNeeded(file: Express.Multer.File): Promise<{
  buffer: Buffer;
  mimetype: string;
  filename: string;
}> {
  // Return the original file data if not HEIC
  if (file.mimetype !== 'image/heic') {
    return {
      buffer: file.buffer,
      mimetype: file.mimetype,
      filename: file.originalname,
    };
  }

  try {
    // Convert HEIC to JPEG
    const jpegBuffer = await heicConvert({
      buffer: file.buffer,
      format: 'JPEG',
      quality: 0.9, // Adjust quality as needed (0-1)
    });

    // Create a new filename with jpg extension
    const nameWithoutExt = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    const newFilename = `${nameWithoutExt}.jpg`;

    logger.info(`Converted HEIC image to JPEG: ${newFilename}`);

    return {
      buffer: Buffer.from(jpegBuffer),
      mimetype: 'image/jpeg',
      filename: newFilename,
    };
  } catch (error) {
    logger.error(`HEIC conversion error: ${error}`);
    throw new Error('Failed to convert HEIC image');
  }
}

// Generic upload middleware function
const createUploadMiddleware = (folderPath: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const singleUpload = upload.single('image');

    singleUpload(req, res, async err => {
      if (err) {
        logger.error(`Upload error: ${err.message}`);
        return res.status(400).json({ error: err.message });
      }

      // If no file was uploaded, continue to next middleware
      if (!req.file) {
        return next();
      }

      try {
        // Process file (convert HEIC if needed)
        const processedFile = await convertHeicIfNeeded(req.file);

        // Generate a unique filename
        const filename = generateUniqueFilename(processedFile.filename);
        const key = `${folderPath}/${filename}`;

        // Upload to R2
        const result = await uploadFile(
          processedFile.buffer,
          key,
          processedFile.mimetype
        );

        // Add the file info to the request object
        req.fileUrl = result.url;
        req.fileKey = result.key;
        next();
      } catch (error) {
        logger.error(`File processing error: ${error}`);
        return res
          .status(500)
          .json({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to process image',
          });
      }
    });
  };
};

// Create specific middleware functions using the factory
export const uploadProfileImage = createUploadMiddleware('profiles');
export const uploadMessageImage = createUploadMiddleware('messages');

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      fileUrl?: string;
      fileKey?: string;
    }
  }
}

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// R2 configuration
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_BUCKET_URL = process.env.R2_PUBLIC_BUCKET_URL;

// Verify required environment variables
if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
  logger.error('Missing R2 configuration environment variables');
}

// Create S3 client configured for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID || '',
    secretAccessKey: SECRET_ACCESS_KEY || '',
  },
});

/**
 * Upload a file to Cloudflare R2
 * @param buffer The file buffer to upload
 * @param key The object key (path/filename in bucket)
 * @param contentType The content type of the file
 * @returns Object containing the key and URL of the uploaded file
 */
export const uploadFile = async (
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<{ key: string; url: string }> => {
  try {
    // Create command to upload file
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    // Upload to R2
    await s3Client.send(command);

    const url = process.env.NODE_ENV === 'development'
      ? `${PUBLIC_BUCKET_URL}/${key}` // Development mode - public access
      : `https://helloapollo.chat/${key}`; // Production mode with custom domain

    return { key, url };
  } catch (error) {
    logger.error(`Error uploading file to R2: ${error}`);
    throw new Error('Failed to upload file to storage');
  }
};

/**
 * Delete a file from Cloudflare R2
 * @param key The object key to delete
 * @returns True if deletion was successful, false otherwise
 */
export const deleteFile = async (key: string): Promise<boolean> => {
  try {
    if (!key) {
      logger.info('Attempted to delete file with empty key');
      return false;
    }
    
    // Create command to delete file
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    // Delete from R2
    await s3Client.send(command);
    logger.info(`Successfully deleted file from R2: ${key}`);
    return true;
  } catch (error) {
    logger.error(`Error deleting file from R2: ${key} - ${error}`);
    return false;
  }
};

/**
 * Extract key from a file URL
 * @param url The full URL of the file
 * @returns The key part of the URL, or null if the URL format is invalid
 */
export const getKeyFromUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // PUBLIC_BUCKET_URL in development mode
  if (PUBLIC_BUCKET_URL && url.startsWith(PUBLIC_BUCKET_URL)) {
    return url.substring(PUBLIC_BUCKET_URL.length + 1); // +1 for the trailing slash
  }

  // Custom domain in production mode
  const CUSTOM_DOMAIN = 'https://helloapollo.chat';
  if (url.startsWith(CUSTOM_DOMAIN)) {
    return url.substring(CUSTOM_DOMAIN.length + 1);
  }
  
  // Fallback to traditional domain pattern
  const bucketPattern = new RegExp(`https://${BUCKET_NAME}\.${ACCOUNT_ID}\.r2\.cloudflarestorage\.com/(.+)`);
  const match = url.match(bucketPattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  logger.error(`Unable to extract key from URL: ${url}`);
  return null;
};

/**
 * Generate a signed URL for reading an object
 * @param key The object key
 * @param expiresIn Expiration time in seconds (default: 3600)
 * @returns Signed URL
 */
export const getSignedReadUrl = async (
  key: string,
  expiresIn = 3600
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    logger.error(`Error generating signed URL: ${error}`);
    throw new Error('Failed to generate signed URL');
  }
};

/**
 * Get a public URL for an object
 * @param key The object key
 * @returns Public URL
 */
export const getPublicUrl = (key: string): string => {
  if (process.env.NODE_ENV === 'development') {
    return `${PUBLIC_BUCKET_URL}/${key}`;
  } else {
    return `https://helloapollo.chat/${key}`;
  }
};

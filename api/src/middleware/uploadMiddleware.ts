import multer from 'multer';
import path from 'path';

// Uploads directory
const uploads = path.join(__dirname, '../../uploads');
const profileUploads = path.join(uploads, 'profiles');
const messageUploads = path.join(uploads, 'messages');

// Define storage configurations
const profileStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, profileUploads);
  },
  filename(req, file, callback) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const messageStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, messageUploads);
  },
  filename(req, file, callback) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter for images
const imageFilter = (req: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Only image files are allowed'));
  }
};

// Create upload middleware instances
export const uploadUserProfileImage = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: imageFilter,
}).single('image');

export const uploadMessageImage = multer({
  storage: messageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: imageFilter,
}).single('image');

// Helper function to get the URL for an uploaded file
export const getFileUrl = (filename: string, type: 'profile' | 'message'): string => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.API_URL || 'http://localhost:3000'
    : 'http://localhost:3000';
  
  return `${baseUrl}/uploads/${type}s/${filename}`;
};

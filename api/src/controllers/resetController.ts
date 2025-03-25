import { Request, Response, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { createResetToken, resetPassword } from '../models/authModel';
import { sendPasswordResetEmail } from '../services/emailService';
import { logger } from '../utils/logger';

export const validateResetRequest = [
  body('email').trim().isEmail().withMessage('Invalid email address'),
];

export const validateResetConfirm = [
  body('token').trim().notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

export const requestReset: RequestHandler = async (req, res): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { email } = req.body;
    const resetToken = await createResetToken(email);

    // Whether email exists or not, proceed with the reset flow
    // This prevents email enumeration
    if (resetToken) {
      try {
        const emailResult = await sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        logger.error(`Error sending reset email: ${emailError}`);
      }
    }

    // Always return the same message to prevent email enumeration
    res.json({
      message:
        'If an account exists with this email, a password reset link will be sent.',
    });
  } catch (error) {
    logger.error(`Password reset request error: ${error}`);
    res
      .status(500)
      .json({ message: 'Error processing password reset request' });
  }
};

export const confirmReset: RequestHandler = async (req, res): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { token, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await resetPassword(token, hashedPassword);

    if (!user) {
      res.status(400).json({
        message:
          'Invalid or expired reset token. Please request a new password reset.',
      });
      return;
    }

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    logger.error(`Password reset confirmation error: ${error}`);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

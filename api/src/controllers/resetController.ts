import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { createPasswordResetToken, resetPassword } from '../models/authModel';
import { sendPasswordResetEmail } from '../services/emailService';

export const validateResetRequest = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
];

export const validateResetConfirm = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

export const requestReset = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;  
    const resetToken = await createPasswordResetToken(email);

    // Whether email exists or not, proceed with the reset flow
    // This prevents email enumeration
    if (resetToken) {
      try {
        const emailResult = await sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error('Error sending reset email:', emailError);
      }
    }

    // Always return the same message to prevent email enumeration
    res.json({ 
      message: 'If an account exists with this email, a password reset link will be sent.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
};

export const confirmReset = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const user = await resetPassword(token, hashedPassword);

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};
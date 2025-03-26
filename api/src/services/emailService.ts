/**
 * Email Service for sending transactional emails
 * 
 * Architecture decisions:
 * 1. Dual-mode operation:
 *    - Development: Uses Ethereal for test emails that can be previewed in browser
 *    - Production: Uses configured SMTP server from environment variables
 * 
 * 2. Transport creation pattern:
 *    - Creates a new transporter for each email to prevent stale connections
 *    - Automatically generates test credentials in development
 * 
 * Security considerations:
 *    - Email credentials stored only in environment variables
 *    - Links have limited-time validity (handled by the reset token system)
 */
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

/**
 * Creates and configures the appropriate email transport based on environment
 * 
 * In development:
 * - Creates an Ethereal test account automatically 
 * - Provides a preview URL to see the sent email in a browser
 * 
 * In production:
 * - Uses environment variables for SMTP configuration
 * - Requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to be set
 * 
 * @returns Configured nodemailer transport
 */
const createTransporter = async () => {
  // Only create test account in development
  if (process.env.NODE_ENV !== 'production') {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    // Production email settings
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
};

/**
 * Sends a password reset email with a secure reset link
 * 
 * The email contains:
 * 1. A button link to the reset page with the token embedded
 * 2. Plain text fallback link for email clients that block HTML
 * 3. Clear expiration information for the user
 * 
 * Implementation details:
 * - Token is embedded in URL as a query parameter
 * - In development, logs a preview URL for testing
 * - Uses both HTML and plain text versions for compatibility
 * 
 * @param email Recipient email address
 * @param resetToken Secure token that validates the reset request
 * @returns True if email was sent successfully
 * @throws Error if sending fails
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
) => {
  try {
    const transporter = await createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    logger.info(`Reset URL: ${resetUrl}`);

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Messaging App" <no-reply@messaging-app.com>',
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl}
      
If you didn't request this, please ignore this email.

The link will expire in 1 hour.`,
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <p>
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p><strong>The link will expire in 1 hour.</strong></p>`,
    });

    // Log URL for development testing
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    logger.error(`Error sending email: ${error}`);
    throw new Error('Failed to send password reset email');
  }
};

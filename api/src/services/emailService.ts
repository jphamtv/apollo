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
    // Production email settings using SendGrid
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
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
      from: {
        name: 'Apollo Messaging App',
        address: 'no-reply@helloapollo.chat'
      },
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl}
      
If you didn't request this, please ignore this email.

The link will expire in 1 hour.`,
      html: `
        <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
              /* Base styles */
              body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 16px;
              }
              .header {
                text-align: center;
                padding: 20px 0;
              }
              .content {
                background-color: #ffffff;
                padding: 16px;
                border-radius: 4px;
              }
              h1 {
                color: #0b89e9;
                font-size: 24px;
                margin-top: 0;
              }
              p {
                margin-bottom: 16px;
                font-size: 16px;
              }
              .button {
                display: inline-block;
                background-color: #0b89e9;
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                text-align: center;
                margin: 8px 0;
              }
              .link {
                word-break: break-all;
                color: #0b89e9;
              }
              .footer {
                text-align: center;
                font-size: 12px;
                color: #666666;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h1>Password Reset Request</h1>
                <p>You requested a password reset for your Apollo account. Click the button below to reset your password:</p>
                <div>
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p class="link">${resetUrl}</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p><strong>The link will expire in 1 hour.</strong></p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Apollo. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
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

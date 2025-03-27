/**
 * Authentication model handling user accounts and related operations
 *
 * Architecture approach:
 * 1. Transaction-based account creation for data consistency
 * 2. Field-level selection with projection for performance
 * 3. Password reset with secure token generation
 * 4. Cascade deletion strategy for efficient cleanup
 *
 * Security implementation:
 * - Passwords never returned in normal queries (selective inclusion only when needed)
 * - Time-limited reset tokens with cryptographically strong randomness
 * - Expiry validation before any token-based action
 */
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Standard user projection that excludes sensitive fields
 * This pattern ensures passwords and tokens are never accidentally returned
 * Fields can be composed with spreads for different query needs
 */
const userWithProfile = {
  id: true,
  email: true,
  username: true,
  profile: {
    select: {
      displayName: true,
      imageUrl: true,
      bio: true,
    },
  },
};

/**
 * Creates a new user account with default profile
 * Uses a transaction to ensure both user and profile are created atomically
 *
 * @param username Username (also used as initial display name)
 * @param email Email address for authentication
 * @param hashedPassword Pre-hashed password (never store plaintext)
 * @returns Created user object with profile (without password)
 */
export const create = async (
  username: string,
  email: string,
  hashedPassword: string
) => {
  return prisma.$transaction(async tx => {
    // Create user
    const user = await tx.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profile: {
          create: {
            displayName: username, // Default to username, can be updated later
          },
        },
      },
      select: userWithProfile,
    });

    return user;
  });
};

/**
 * Finds a user by email address
 * Only query that intentionally includes password field for authentication
 *
 * @param email Email to search for
 * @returns User with password (for authentication) or null
 */
export const findByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      ...userWithProfile,
      password: true,
    },
  });
};

/**
 * Finds a user by ID
 * Standard safe query that excludes password
 *
 * @param id User ID to find
 * @returns User without password or null
 */
export const findById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: userWithProfile,
  });
};

export const findBotById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      botSystemPrompt: true,
      botQuotes: true,
    },
  });
};

export const findByUsername = async (username: string) => {
  return prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
};

/**
 * Creates a password reset token for a user
 *
 * Security implementation:
 * 1. Uses cryptographically secure random generation (32 bytes = 256 bits)
 * 2. Sets a 1-hour expiration time
 * 3. Only stores the token (not a hash) since it's already a random value
 * 4. Returns null if user not found to prevent user enumeration
 *
 * @param email Email address of user requesting reset
 * @returns Reset token or null if user not found
 */
export const createResetToken = async (
  email: string
): Promise<string | null> => {
  const user = await findByEmail(email);
  if (!user) return null;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  await prisma.user.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  return resetToken;
};

/**
 * Resets a user's password using a valid token
 *
 * Validation process:
 * 1. Finds a user with the given token
 * 2. Ensures token hasn't expired
 * 3. Updates password and clears token data
 * 4. Returns updated user or null if token invalid/expired
 *
 * @param token Reset token to validate
 * @param newPassword New hashed password to set
 * @returns Updated user without password or null
 */
export const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return null;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      password: newPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
    select: userWithProfile,
  });
};

/**
 * Deletes a user account with all related data
 * Relies on database cascade deletion for cleanup of:
 * - Messages sent by the user
 * - Conversation participations
 * - User profile
 *
 * @param id User ID to delete
 */
export const deleteById = async (id: string): Promise<void> => {
  // With onDelete: Cascade in the schema, deleting the user will automatically
  // delete related messages, conversation participants, and user profile
  await prisma.user.delete({
    where: { id },
  });
};

export default {
  create,
  findByEmail,
  findById,
  createResetToken,
  resetPassword,
  deleteById,
};

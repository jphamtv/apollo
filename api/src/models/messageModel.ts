/**
 * Message data model using Prisma ORM
 *
 * Design considerations:
 * - Includes sender information with each query to prevent N+1 query problems
 * - Uses single-level includes rather than nested includes for better performance
 * - Messages are intentionally limited to 50 per query as text messages are small enough
 *   that pagination isn't necessary for performance, simplifying the frontend implementation
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { MessageWithDetails } from '../types';
import { deleteFile, getKeyFromUrl } from '../services/fileStorageService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Creates a new message with sender details included in the response
 * Used in both regular user messages and AI bot responses
 */
export const create = async (
  data: Prisma.MessageCreateInput
): Promise<MessageWithDetails> => {
  return prisma.message.create({
    data,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
};

export const findById = async (
  id: string
): Promise<MessageWithDetails | null> => {
  return prisma.message.findUnique({
    where: { id },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
};

/**
 * Retrieves all messages for a conversation in descending order (newest first)
 * Limited to 50 messages per query - this intentionally avoids pagination for simplicity
 * as the application doesn't need to support viewing extensive message history
 */
export const findByConversationId = async (
  conversationId: string
): Promise<MessageWithDetails[]> => {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          isBot: true,
        },
      },
    },
  });
};

export const markAsRead = async (id: string): Promise<MessageWithDetails> => {
  return prisma.message.update({
    where: { id },
    data: { isRead: true },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
};

/**
 * Deletes a message and its associated image (if any)
 * Follows the pattern of handling resource cleanup in the model layer
 *
 * @param id Message ID to delete
 */
export const deleteById = async (id: string): Promise<void> => {
  try {
    // First fetch the message to check if it has an image
    const message = await prisma.message.findUnique({
      where: { id },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    if (!message) {
      logger.warn(`Attempted to delete non-existent message: ${id}`);
      return;
    }

    // Delete the image from R2 if it exists
    if (message.imageUrl) {
      const key = getKeyFromUrl(message.imageUrl);
      if (key) {
        await deleteFile(key);
        logger.info(`Deleted message image: ${key}`);
      }
    }

    // Delete the message from the database
    await prisma.message.delete({
      where: { id },
    });

    logger.info(`Message ${id} deleted successfully`);
  } catch (error) {
    logger.error(`Error deleting message ${id}: ${error}`);
    throw error;
  }
};

export default {
  create,
  findById,
  findByConversationId,
  markAsRead,
  deleteById,
};

import { PrismaClient, Prisma } from '@prisma/client';
import { ConversationWithDetails } from '../types';
import { deleteFile, getKeyFromUrl } from '../services/fileStorageService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Common user selection fields to include with conversation data
const userSelect = {
  id: true,
  username: true,
  isBot: true,
  profile: {
    select: {
      displayName: true,
      imageUrl: true,
      bio: true,
    },
  },
};

export const create = async (
  data: Prisma.ConversationCreateInput
): Promise<ConversationWithDetails> => {
  return prisma.conversation.create({
    data,
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      participants: {
        include: {
          user: {
            select: userSelect,
          },
        },
      },
    },
  });
};

export const findConversationsByUserId = async (userId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      participants: {
        include: {
          user: {
            select: userSelect,
          },
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    // Sort conversations by the most recent update
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Calculate unread status for each conversation
  const conversationsWithUnreadStatus = await Promise.all(
    conversations.map(async conversation => {
      const hasUnread = await hasUnreadMessages(conversation.id, userId);
      return {
        ...conversation,
        hasUnread,
      };
    })
  );

  return conversationsWithUnreadStatus;
};

export const findById = async (
  id: string
): Promise<ConversationWithDetails | null> => {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      participants: {
        include: {
          user: {
            select: userSelect,
          },
        },
      },
    },
  });
};

// Finds an existing conversation between participants (handles both direct and group chats)
export const findExistingConversationByParticipants = async (
  participantIds: string[]
) => {
  // Special case for direct (non-group) conversations
  if (participantIds.length === 2) {
    return prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          // Both participants must be in this conversation
          { participants: { some: { userId: participantIds[0] } } },
          { participants: { some: { userId: participantIds[1] } } },
          // Total participant count must be exactly 2
          { participants: { none: { userId: { notIn: participantIds } } } },
        ],
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        participants: {
          include: {
            user: {
              select: userSelect,
            },
          },
        },
      },
    });
  }

  // For group conversations
  return prisma.conversation.findFirst({
    where: {
      isGroup: true,
      // All specified participants must be in the conversation
      AND: [
        ...participantIds.map(id => ({
          participants: { some: { userId: id } },
        })),
        // For groups, ensure ONLY these participants exist
        {
          participants: {
            none: {
              userId: { notIn: participantIds },
            },
          },
        },
      ],
    },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      participants: {
        include: {
          user: {
            select: userSelect,
          },
        },
      },
    },
  });
};

export const update = async (
  id: string,
  data: Prisma.ConversationUpdateInput
): Promise<ConversationWithDetails | null> => {
  return prisma.conversation.update({
    where: { id },
    data,
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      participants: {
        include: {
          user: {
            select: userSelect,
          },
        },
      },
    },
  });
};

export const addParticipant = async (
  conversationId: string,
  userId: string
) => {
  return prisma.conversationParticipant.create({
    data: {
      conversation: { connect: { id: conversationId } },
      user: { connect: { id: userId } },
    },
  });
};

export const removeParticipant = async (
  conversationId: string,
  userId: string
) => {
  return prisma.conversationParticipant.delete({
    where: {
      userId_conversationId: {
        userId,
        conversationId,
      },
    },
  });
};

// Verifies if a user is a participant in a conversation (used for permission checks)
export const isParticipant = async (
  userId: string,
  conversationId: string
): Promise<boolean> => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId,
        conversationId,
      },
    },
  });
  return !!participant; // "!!"" converts to boolean
};

/**
 * Deletes a conversation and all related data (participants and messages) in a transaction
 * Also deletes all image files from Cloudflare R2 associated with messages in the conversation
 * 
 * @param id Conversation ID to delete
 */
export const deleteById = async (id: string): Promise<void> => {
  try {
    // First, fetch all messages with images in this conversation
    const messagesWithImages = await prisma.message.findMany({
      where: {
        conversationId: id,
        imageUrl: {
          not: null,
        },
      },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    // Delete all image files from R2
    if (messagesWithImages.length > 0) {
      for (const message of messagesWithImages) {
        if (message.imageUrl) {
          const key = getKeyFromUrl(message.imageUrl);
          if (key) {
            await deleteFile(key);
            logger.info(`Deleted message image from conversation ${id}: ${key}`);
          }
        }
      }
    }

    // Then delete all database records in a transaction
    await prisma.$transaction([
      prisma.conversationParticipant.deleteMany({
        where: { conversationId: id },
      }),
      prisma.message.deleteMany({
        where: { conversationId: id },
      }),
      prisma.conversation.delete({
        where: { id },
      }),
    ]);
    
    logger.info(`Conversation ${id} deleted successfully with all associated data`);
  } catch (error) {
    logger.error(`Error deleting conversation ${id}: ${error}`);
    throw error;
  }
};

// Checks if a conversation has any unread messages for a specific user
export const hasUnreadMessages = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  const unreadCount = await prisma.message.count({
    where: {
      conversationId,
      isRead: false,
      NOT: {
        senderId: userId, // Don't count user's own messages
      },
    },
  });

  return unreadCount > 0;
};

// Marks all messages in a conversation as read for a specific user
// Returns the count of messages that were marked as read
export const markConversationAsRead = async (
  conversationId: string,
  userId: string
): Promise<number> => {
  // First verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId,
        conversationId,
      },
    },
  });

  if (!participant) {
    throw new Error('User is not a participant in this conversation');
  }

  // Mark all messages as read
  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      isRead: false,
      NOT: {
        senderId: userId, // Don't mark messages sent by the sender
      },
    },
    data: {
      isRead: true,
    },
  });

  return result.count;
};

export default {
  create,
  findById,
  findConversationsByUserId,
  findExistingConversationByParticipants,
  update,
  addParticipant,
  removeParticipant,
  isParticipant,
  deleteById,
  markConversationAsRead,
};

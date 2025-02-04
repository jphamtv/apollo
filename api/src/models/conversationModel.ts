import { PrismaClient, Prisma, ConversationParticipant, Message } from "@prisma/client";
const prisma = new PrismaClient();

interface ConversationData {
  name?: string; // For group chats
  isGroup?: boolean;
  messages?: Prisma.MessageCreateInput[];
  participants?: Prisma.ConversationParticipantCreateInput[];
}

interface ConversationWithDetails {
  id: string;
  name?: string;
  isGroup: boolean;
  messages: Message[];
  participants: ConversationParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

export const createNew = async (data: ConversationData): Promise<ConversationWithDetails> => {
  return prisma.conversation.create({
    data,
    include: {
      messages: true,
      participants: true
    },
  });
};

export const getAllByUserId = async (userId: string) => {
  return prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc'},
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

export const getById = async (id: string): Promise<ConversationWithDetails | null> => {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: true,
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });
};

export const update = async (
  id: string,
  data: ConversationData
): Promise<ConversationWithDetails | null> => {
  return prisma.conversation.update({
    where: { id },
    data,
    include: {
      messages: true,
      participants: true,
    },
  });
}; 

export const addParticipant = async (
  conversationId: string,
  userId: string
): Promise<ConversationParticipant> => {
  return prisma.conversationParticipant.create({
    data: {
      conversationId,
      userId,
    },
  });
};

export const removeParticipant = async (
  conversationId: string,
  userId: string
): Promise<ConversationParticipant> => {
  return prisma.conversationParticipant.delete({
    where: {
      userId_conversationId: {
        conversationId,
        userId,
      },
    },
  });
};

export const deleteConversation = async (id: string): Promise<void> => {
  await prisma.conversation.delete({
    where: { id },
  });
};

export const getConversationsWithLatestMessage = async (userId: string) => {
  return prisma.conversation.findMany({
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
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });
};

export default {
  createNew,
  getAllByUserId,
  getById,
  update,
  addParticipant,
  removeParticipant,
  deleteConversation,
  getConversationsWithLatestMessage,
};
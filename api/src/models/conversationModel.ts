import { PrismaClient, Prisma, ConversationParticipant, Message } from "@prisma/client";
const prisma = new PrismaClient();

export const createNew = async (data: Prisma.ConversationCreateInput): Promise<ConversationWithDetails> => {
  return prisma.conversation.create({
    data,
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
  data: Prisma.ConversationUpdateInput
): Promise<ConversationWithDetails | null> => {
  return prisma.conversation.update({
    where: { id },
    data,
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

export const deleteConversation = async (id: string): Promise<void> => {
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
};

export default {
  createNew,
  getAllByUserId,
  getById,
  update,
  addParticipant,
  removeParticipant,
  getConversationsWithLatestMessage,
  deleteConversation,
};
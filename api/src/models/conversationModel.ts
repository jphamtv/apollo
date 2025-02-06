import { PrismaClient, Prisma } from "@prisma/client";
import { ConversationWithDetails } from "../types";

const prisma = new PrismaClient();

export const create = async (data: Prisma.ConversationCreateInput): Promise<ConversationWithDetails> => {
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

export const findConversationsByUserId = async (userId: string) => {
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

export const findById = async (id: string): Promise<ConversationWithDetails | null> => {
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

export const isParticipant = async (
  userId: string,
  conversationId: string
): Promise<boolean> => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId,
        conversationId
      }
    }
  });
  return !!participant; // "!!"" converts to boolean
};

export const deleteById = async (id: string): Promise<void> => {
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
  create,
  findById,
  findConversationsByUserId,
  update,
  addParticipant,
  removeParticipant,
  isParticipant,
  deleteById,
};
import { PrismaClient, Prisma } from "@prisma/client";
import { MessageWithDetails } from "../types";

const prisma = new PrismaClient();

export const create = async (data: Prisma.MessageCreateInput): Promise<MessageWithDetails> => {
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

export const findById = async (id: string): Promise<MessageWithDetails | null> => {
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

export const findByConversationId = async (conversationId: string): Promise<MessageWithDetails[]> => {
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
    }
  });
};

export const markAsRead = async (
  id: string
): Promise<MessageWithDetails> => {
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

export const deleteById = async (id: string) => {
  return prisma.message.delete({
    where: { id },
  });
};

export default {
  create,
  findById,
  findByConversationId,
  markAsRead,
  deleteById,
};
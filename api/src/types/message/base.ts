import { Prisma } from "@prisma/client";

export type MessageWithDetails = Prisma.MessageGetPayload<{
  include: {
    sender: {
      select: {
        id: true,
        username: true,
      },
    },
  },
}>;

export type MessageResponse = {
  id: string;
  text: string;
  conversationId: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    username: string;
  };
};

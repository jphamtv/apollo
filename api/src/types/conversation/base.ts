import { Prisma } from "@prisma/client";

export type ConversationWithDetails = Prisma.ConversationGetPayload<{
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
}>;

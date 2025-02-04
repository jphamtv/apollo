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

export type ConversationPreview = Prisma.ConversationGetPayload<{
  include: {
    messages: {
      take: 1;
      orderBy: {
        createdAt: 'desc';
      };
    };
    participants: {
      include: {
        user: {
          select: {
            id: true;
            username: true;
          };
        };
      };
    };
    _count: {
      select: {
        messages: true;
      };
    };
  };
}>;
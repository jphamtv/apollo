import { Prisma } from '@prisma/client';

export type MessageWithDetails = Prisma.MessageGetPayload<{
  include: {
    sender: {
      select: {
        id: true;
        username: true;
      };
    };
  };
}>;

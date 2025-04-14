import { Prisma, User as PrismaUser } from '@prisma/client';

// Base Prisma-generated user type
export type User = PrismaUser;

// Common user select types
export type UserBasicDetails = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    username: true;
  };
}>;

export type UserWithAuth = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    username: true;
    password: true;
  };
}>;

// Bot-related user type
export type UserWithBotDetails = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    isBot: true;
    botInitialMessage: true;
  };
}>;

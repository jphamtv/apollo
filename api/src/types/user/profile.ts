import { Prisma } from "@prisma/client";

export type UserWithProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    profile: {
      select: {
        displayName: true;
        bio: true;
        imageUrl: true;
      };
    };
  };
}>;

export type UserProfileDetails = Prisma.UserProfileGetPayload<{
  select: {
    displayName: true;
    bio: true;
    imageUrl: true;
  };
}>;

export type SearchUserResult = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    isBot: true;
    profile: {
      select: {
        displayName: true;
        imageUrl: true;
      };
    };
  };
}>;
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
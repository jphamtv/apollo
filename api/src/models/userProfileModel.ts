import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

type UserProfileWithDetails = Prisma.UserGetPayload<{
  select: {
    id: true,
    username: true
    profile: {
      select: {
        displayName: true,
        bio: true,
        imageUrl: true,
      },
    },
  },
}>;

type ProfileDetails = Prisma.UserProfileGetPayload<{
  select: {
    displayName: true,
    bio: true,
    imageUrl: true,
  },
}>;

export const getByUsername = async (
  username: string
): Promise<UserProfileWithDetails | null> => {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      profile: {
        select: {
          displayName: true,
          bio: true,
          imageUrl: true,
        },
      },
    },
  });
};

export const getByUserId = async (
  userId: string
): Promise<ProfileDetails | null> => {
  return prisma.userProfile.findUnique({
    where: { userId },
      select: {
        displayName: true,
        bio: true,
        imageUrl: true,
      },
  });
};

export const update = async (
  userId: string,
  data: Prisma.UserProfileUpdateInput
): Promise<ProfileDetails | null> => {
  return prisma.userProfile.update({
    where: { userId },
    data,
    select: {
      displayName: true,
      bio: true,
      imageUrl: true
    },
  });
} 


export default {
  getByUsername,
  getByUserId,
  update
};
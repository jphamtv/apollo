import { PrismaClient, Prisma } from "@prisma/client";
import { UserWithProfile, UserProfileDetails } from '../types';

const prisma = new PrismaClient();

export const getByUsername = async (
  username: string
): Promise<UserWithProfile | null> => {
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
): Promise<UserProfileDetails | null> => {
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
): Promise<UserProfileDetails | null> => {
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
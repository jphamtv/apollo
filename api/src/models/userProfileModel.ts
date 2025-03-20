import { PrismaClient, Prisma } from "@prisma/client";
import { UserWithProfile, UserProfileDetails, SearchUserResult } from '../types';

const prisma = new PrismaClient();

export const findByUsername = async (
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

export const findByUserId = async (
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

export const findByQuery = async (
  query: string,
  currentUserId: string
): Promise<SearchUserResult[]> => {
  return prisma.user.findMany({
    where: {
      OR: [
        {
          username: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          profile: {
            displayName: {
              contains: query,
              mode: 'insensitive'
            }
          }
        }
      ],
      NOT: {
        id: currentUserId
      }
    },
    select: {
      id: true,
      username: true,
      isBot: true,
      profile: {
        select: {
          displayName: true,
          imageUrl: true
        }
      }
    },
    take: 10
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
  findByUsername,
  findByUserId,
  findByQuery,
  update
};
import { PrismaClient, Prisma } from '@prisma/client';
import {
  UserWithProfile,
  UserProfileDetails,
  SearchUserResult,
} from '../types';
import { deleteFile, getKeyFromUrl } from '../services/fileStorageService';
import { logger } from '../utils/logger';

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
            mode: 'insensitive',
          },
        },
        {
          profile: {
            displayName: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
      ],
      NOT: {
        id: currentUserId,
      },
    },
    select: {
      id: true,
      username: true,
      isBot: true,
      profile: {
        select: {
          displayName: true,
          imageUrl: true,
        },
      },
    },
    take: 10,
  });
};

/**
 * Updates a user profile and handles image replacement if needed
 * If the imageUrl is changing, the old image is deleted from storage
 * 
 * @param userId User ID whose profile to update
 * @param data Profile data to update
 * @returns Updated profile details
 */
export const update = async (
  userId: string,
  data: Prisma.UserProfileUpdateInput
): Promise<UserProfileDetails | null> => {
  try {
    // If we're updating the imageUrl, we need to check if we should delete an old image
    if ('imageUrl' in data) {
      // Get the current profile to check for existing image
      const currentProfile = await findByUserId(userId);
      
      // If there's an existing image and it's changing (or being removed)
      if (currentProfile?.imageUrl && currentProfile.imageUrl !== data.imageUrl) {
        const key = getKeyFromUrl(currentProfile.imageUrl);
        if (key) {
          await deleteFile(key);
          logger.info(`Deleted old profile image for user ${userId}: ${key}`);
        }
      }
    }
    
    // Perform the update
    return prisma.userProfile.update({
      where: { userId },
      data,
      select: {
        displayName: true,
        bio: true,
        imageUrl: true,
      },
    });
  } catch (error) {
    logger.error(`Error updating user profile for ${userId}: ${error}`);
    throw error;
  }
};

/**
 * Updates a user's profile image
 * Handles deletion of the old image if one exists
 * Uses the general update function internally to avoid code duplication
 * 
 * @param userId User ID whose profile image to update
 * @param imageUrl New image URL (or null to remove)
 * @returns Updated profile details
 */
export const updateProfileImage = async (
  userId: string,
  imageUrl: string | null
): Promise<UserProfileDetails | null> => {
  try {
    // Simply delegate to the update function with the imageUrl parameter
    return update(userId, { imageUrl });
  } catch (error) {
    logger.error(`Error updating profile image for ${userId}: ${error}`);
    throw error;
  }
};

export default {
  findByUsername,
  findByUserId,
  findByQuery,
  update,
  updateProfileImage,
};

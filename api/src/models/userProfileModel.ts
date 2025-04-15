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
 * If imageUrl is not provided, preserves the existing value
 *
 * @param userId User ID whose profile to update
 * @param data Profile data to update
 * @returns Updated profile details
 */
/**
 * Updates a user profile's text information only (displayName and bio)
 * Image updates are handled separately through updateProfileImage
 */
export const updateProfileText = async (
  userId: string,
  data: { displayName: string; bio?: string }
): Promise<UserProfileDetails | null> => {
  try {
    // We only update displayName and bio here, leaving imageUrl untouched
    return prisma.userProfile.update({
      where: { userId },
      data: {
        displayName: data.displayName,
        bio: data.bio,
      },
      select: {
        displayName: true,
        bio: true,
        imageUrl: true, // Still include imageUrl in the response
      },
    });
  } catch (error) {
    logger.error(`Error updating user profile text for ${userId}: ${error}`);
    throw error;
  }
};

/**
 * Updates a user's profile image independently from text fields
 * Handles deletion of the old image if one exists
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
    // Get current profile to check for existing image
    const currentProfile = await findByUserId(userId);

    // Delete old image if it exists and is changing
    if (currentProfile?.imageUrl && currentProfile.imageUrl !== imageUrl) {
      const key = getKeyFromUrl(currentProfile.imageUrl);
      if (key) {
        await deleteFile(key);
        logger.info(`Deleted old profile image for user ${userId}: ${key}`);
      }
    }

    // Update just the imageUrl field
    return prisma.userProfile.update({
      where: { userId },
      data: { imageUrl },
      select: {
        displayName: true,
        bio: true,
        imageUrl: true,
      },
    });
  } catch (error) {
    logger.error(`Error updating profile image for ${userId}: ${error}`);
    throw error;
  }
};

/**
 * Retrieves all users except the current user
 * Used for displaying available users in the new conversation selector
 *
 * @param id Current user ID to exclude from results
 * @returns All users sorted alphabetically by display name
 */
export const findAll = async (id: string) => {
  return prisma.user.findMany({
    where: {
      id: { not: id },
    },
    select: {
      id: true,
      username: true,
      isBot: true,
      profile: {
        select: {
          displayName: true,
          imageUrl: true,
          bio: true,
        },
      },
    },
    orderBy: {
      profile: {
        displayName: 'asc',
      },
    },
  });
};

export default {
  findByUsername,
  findByUserId,
  findByQuery,
  updateProfileText,
  updateProfileImage,
  findAll,
};

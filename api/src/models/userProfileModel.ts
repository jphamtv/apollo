import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  imageUrl?: string;
}

export const getByUsername = async (username: string) => {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      profile: {
        select: {
          displayName: true,
          bio: true,
          imageUrl: true
        }
      }
    }
  });
};

export const getByUserId = async (userId: string) => {
  return prisma.userProfile.findUnique({
    where: { userId },
      select: {
        displayName: true,
        bio: true,
        imageUrl: true
      }
  });
};

export const update = async (userId: string, data: UpdateProfileData) => {
  return prisma.userProfile.update({
    where: { userId },
    data,
    select: {
      displayName: true,
      bio: true,
      imageUrl: true
    }
  });
} 


export default {
  getByUsername,
  getByUserId,
  update
};
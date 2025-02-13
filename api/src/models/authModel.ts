import { PrismaClient } from "@prisma/client";
import crypto from 'crypto';
import { UserBasicDetails, UserWithAuth } from "../types";

const prisma = new PrismaClient();

const userWithProfile = {
  id: true,
  email: true,
  username: true,
  profile: {
    select: {
      displayName: true,
      imageUrl: true,
      bio: true
    }
  }
};

export const create = async (
  username: string,
  email: string,
  hashedPassword: string,
) => {
  return prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profile: {
          create: {
            displayName: username, // Default to username, can be updated later
          }
        }
      },
      select: userWithProfile
    });
    
    return user;
  });
};

export const findByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      ...userWithProfile,
      password: true,
    },
  });
};

export const findById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: userWithProfile
  });
};

export const createResetToken = async (email: string): Promise<string | null> => {
  const user = await findByEmail(email);
  if (!user) return null;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  await prisma.user.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  return resetToken;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return null;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      password: newPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
    select: userWithProfile
  });
};

export default {
  create,
  findByEmail,
  findByUsername,
  findById,
  createResetToken,
  resetPassword,
};
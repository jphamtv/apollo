import { PrismaClient } from "@prisma/client";
import crypto from 'crypto';
import { UserBasicDetails, UserWithAuth } from "../types";

const prisma = new PrismaClient();

export const create = async (
  username: string,
  email: string,
  hashedPassword: string,
): Promise<UserBasicDetails> => {
  return prisma.$transaction(async (tx) => {
    // Create user
    const user = tx.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });
    
    // Create associated profile
    await tx.userProfile.create({
      data: {
        userId: (await user).id,
        displayName: username, // Default to username, can be updated later
      }
    });

    return user;
  });
};
  

export const findByEmail = async (
  email: string
): Promise<UserWithAuth | null> => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
    },
  });
};

export const findByUsername = async (
  username: string
): Promise<UserWithAuth | null> => {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
    },
  });
};

export const findById = async (
  id: string
): Promise<UserBasicDetails | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
    },
  });
};

export const createResetToken = async (
  email: string
): Promise<string | null> => {
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

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<UserBasicDetails | null> => {
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
    select: {
      id: true,
      email: true,
      username: true,
    },
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
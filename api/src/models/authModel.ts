import { PrismaClient, Prisma } from "@prisma/client";
import crypto from 'crypto';
const prisma = new PrismaClient();

export const createNew = async (
  username: string,
  email: string,
  hashedPassword: string,
): Promise<UserBasicDetails> => {
  return prisma.user.create({
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
};

export const getByEmail = async (
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

export const getByUsername = async (
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

export const getById = async (
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

export const createPasswordResetToken = async (
  email: string
): Promise<string | null> => {
  const user = await getByEmail(email);
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
  createNew,
  getByEmail,
  getByUsername,
  getById,
  createPasswordResetToken,
  resetPassword,
};
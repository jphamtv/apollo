import { PrismaClient, Prisma } from "@prisma/client";
import crypto from 'crypto';
const prisma = new PrismaClient();

export const createNew = async (
  username: string,
  email: string,
  hashedPassword: string,
) => {
  const data: Prisma.UserCreateInput = {
    username,
    email,
    password: hashedPassword,
  };
  return prisma.user.create({ data });
};

export const getByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const getById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const createPasswordResetToken = async (email: string) => {
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
  });
};

export default {
  createNew,
  getByEmail,
  getById,
  createPasswordResetToken,
  resetPassword,
};
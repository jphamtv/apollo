import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

export const createNew = async (
  username: string,
  email: string,
  hashedPassword: string,
  isAdmin: boolean = false,
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

export default {
  createNew,
  getByEmail,
  getById,
};

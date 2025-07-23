import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import crypto from 'crypto';

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: { name: data.name, email: data.email, password: hashedPassword },
  });
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && await bcrypt.compare(password, user.password)) return user;
  return null;
};

export const generateResetToken = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { email },
    data: { resetToken: token, tokenExpiry: expiry },
  });

  return { token, email };
};

export const resetPasswordWithToken = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      tokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) return null;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      tokenExpiry: null,
    },
  });

  return true;
};


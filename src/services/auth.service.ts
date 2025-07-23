import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: { name: data.name, email: data.email, password: data.password },
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

  const payload = { userId: user.id, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' }); 

  return { token, email };
};

export const verifyResetToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return decoded;
  } catch (err) {
    return null;
  }
};

export const resetPasswordWithToken = async (token: string, newPassword: string) => {
  const decoded = verifyResetToken(token);
  if (!decoded) return null;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: decoded.userId },
    data: { password: hashedPassword },
  });

  return true;
};

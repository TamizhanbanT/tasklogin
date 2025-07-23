import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const verifyResetTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.params.token;

  if (!token) {
    return res.status(400).send('Token is missing');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    (req as any).user = decoded; 
    next();
  } catch (err) {
    return res.status(401).send('Invalid or expired token');
  }
};

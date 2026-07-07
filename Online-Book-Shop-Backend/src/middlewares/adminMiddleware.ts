import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only access' });
  }
  next();
};
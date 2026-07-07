import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.models';
import { AuthRequest } from '../types/express'
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/apiError';

interface JwtPayload {
  id: number;
  iat?: number;
  exp?: number;
}

export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1️⃣ Get token from headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Not authorized, token missing');
    }

    const token = authHeader.split(' ')[1];

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // 3️⃣ Get user from DB
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    // 4️⃣ Attach user to request
    req.user = user;

    next();
  }
);
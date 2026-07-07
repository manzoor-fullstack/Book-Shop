import { Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types/express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAll,
} from '../services/notificationService';

export const listNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const [notifications, unread] = await Promise.all([
      getUserNotifications(req.user!.id),
      getUnreadCount(req.user!.id),
    ]);
    return res
      .status(200)
      .json(new ApiResponse(200, { notifications, unread }, 'Notifications fetched'));
  }
);

export const readNotification = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await markAsRead(req.user!.id, Number(req.params.id));
    return res.status(200).json(new ApiResponse(200, null, 'Marked as read'));
  }
);

export const readAllNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await markAllAsRead(req.user!.id);
    return res.status(200).json(new ApiResponse(200, null, 'All marked as read'));
  }
);

export const clearNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await clearAll(req.user!.id);
    return res.status(200).json(new ApiResponse(200, null, 'Notifications cleared'));
  }
);

import { Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types/express';
import { UserSetting } from '../models';

const getOrCreate = async (userId: number) => {
  const [settings] = await UserSetting.findOrCreate({ where: { userId } });
  return settings;
};

/** Get the current user's settings/preferences. */
export const getSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const settings = await getOrCreate(req.user!.id);
  return res.status(200).json(new ApiResponse(200, settings, 'Settings fetched'));
});

/** Update the current user's settings/preferences. */
export const updateSettings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const settings = await getOrCreate(req.user!.id);
    const { theme, emailNotifications, orderUpdates, marketingEmails } = req.body;

    if (theme !== undefined) settings.theme = theme;
    if (emailNotifications !== undefined) settings.emailNotifications = !!emailNotifications;
    if (orderUpdates !== undefined) settings.orderUpdates = !!orderUpdates;
    if (marketingEmails !== undefined) settings.marketingEmails = !!marketingEmails;

    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings, 'Settings updated'));
  }
);

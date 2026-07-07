import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import {
  registerUser,
  loginUser,
  generateResetToken,
  resetPassword,
  getCurrentUser,
  deleteUser,
} from '../services/authService';
import { updateUserProfile } from '../services/authService';
import { AuthRequest } from '../types/express';
import { ApiResponse } from '../utils/apiResponse';
import { sendEmail, passwordResetEmail, isEmailLive } from '../services/emailService';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const response = await registerUser({
    ...req.body,
    profileImage: req.file?.buffer, // if using multer
  });

  res.status(response.statusCode).json(response);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const response = await loginUser(email, password);

  res.status(response.statusCode).json(response);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await generateResetToken(email);

  // Send the reset email if the user exists (fail silently for enumeration safety).
  if (result) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${result.resetToken}`;
    const { subject, html } = passwordResetEmail(result.name, resetUrl);
    try {
      await sendEmail({ to: result.email, subject, html });
    } catch (err) {
      console.error('Failed to send reset email:', (err as Error).message);
    }

    // In mock mode (no SMTP) expose the token so the flow is testable end-to-end.
    const devPayload = isEmailLive()
      ? {}
      : { resetToken: result.resetToken, resetUrl };

    return res.status(200).json(
      new ApiResponse(
        200,
        devPayload,
        'If an account exists for that email, a reset link has been sent.'
      )
    );
  }

  // Generic response even when the email is unknown.
  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      'If an account exists for that email, a reset link has been sent.'
    )
  );
});

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const response = await resetPassword(token, password);

    res.status(response.statusCode).json(response);
  }
);

// Get Current User
export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const response = await getCurrentUser(req.user!.id);

    res.status(response.statusCode).json(response);
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const response = await updateUserProfile(req.user!.id, {
      ...req.body,
      profileImage: req.file?.buffer, // multer
    });

    res.status(response.statusCode).json(response);
  }
);

// Delete User
export const deleteAccount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const response = await deleteUser(req.user!.id);

    res.status(response.statusCode).json(response);
  }
);
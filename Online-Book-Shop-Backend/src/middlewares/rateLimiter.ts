import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';

const isTest = process.env.NODE_ENV === 'test';
const passthrough: RequestHandler = (_req, _res, next) => next();

/** General API limiter — protects the whole API from abuse. */
export const apiLimiter: RequestHandler = isTest
  ? passthrough
  : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

/** Stricter limiter for auth endpoints (login/register/reset) to slow brute force. */
export const authLimiter: RequestHandler = isTest
  ? passthrough
  : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in a few minutes.',
  },
});

import { Request } from 'express';
import User from '../models/User.models';

export interface AuthRequest extends Request {
  user?: User; // attached by protect middleware
}
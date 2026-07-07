import express from 'express';
import {
  listUsers,
  getUser,
  toggleUserActive,
  updateUserRole,
} from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/adminMiddleware';

const router = express.Router();

// All routes here are admin-only (customer management)
router.get('/', protect, isAdmin, listUsers);
router.get('/:id', protect, isAdmin, getUser);
router.patch('/:id/toggle-active', protect, isAdmin, toggleUserActive);
router.patch('/:id/role', protect, isAdmin, updateUserRole);

export default router;

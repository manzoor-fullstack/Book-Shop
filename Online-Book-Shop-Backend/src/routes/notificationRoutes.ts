import express from 'express';
import {
  listNotifications,
  readNotification,
  readAllNotifications,
  clearNotifications,
} from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', protect, listNotifications);
router.patch('/read-all', protect, readAllNotifications);
router.patch('/:id/read', protect, readNotification);
router.delete('/', protect, clearNotifications);

export default router;

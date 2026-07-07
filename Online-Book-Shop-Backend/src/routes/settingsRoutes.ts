import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);

export default router;

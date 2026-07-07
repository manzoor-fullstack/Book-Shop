import express from 'express';
import {
  getBookReviews,
  upsertReview,
  deleteReview,
} from '../controllers/reviewController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/book/:bookId', getBookReviews);
router.post('/book/:bookId', protect, upsertReview);
router.delete('/:id', protect, deleteReview);

export default router;

import express from 'express';
import { stripeWebhook } from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Stripe webhook endpoint (no auth needed as Stripe calls it)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
import express from 'express';
import { createCheckoutSession, stripeWebhooks } from '../controllers/stripeWebhooks.js';
import { protect } from '../middleware/authMiddleware.js';

const stripeRouter = express.Router();

// Stripe webhook endpoint
stripeRouter.post('/webhook', stripeWebhooks);

// Create checkout session (protected route)
stripeRouter.post('/create-checkout-session', protect, createCheckoutSession);

// Webhook endpoint (no auth needed)
stripeRouter.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhooks);

export default stripeRouter;
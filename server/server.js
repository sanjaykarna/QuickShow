import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';

const app = express();
const port = 3000;

// Connect DB first
await connectDB();

console.log(`Registering ${functions.length} Inngest functions:`, functions.map(f => f.id || 'unnamed'));

// --- MIDDLEWARE ORDER MATTERS ---

// Parse JSON body for all routes EXCEPT Stripe webhook
app.use(express.json());

// CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://your-frontend-domain.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
  })
);

// Clerk auth middleware (applies after public routes if needed)
app.use(clerkMiddleware());

// --- ROUTES ---

// Inngest route (now after express.json so sync body is parsed)
app.use(
  '/api/inngest',
  serve({
    client: inngest,
    functions,
  })
);

// Stripe webhook (raw body for signature verification)
app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// API Routes
app.get('/', (req, res) => res.send('Server is Live!'));
app.use('/api/show', showRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Local dev listener
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

export default app;

// Disable Vercel’s built-in body parser for webhooks
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

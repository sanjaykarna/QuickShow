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

// ✅ Connect DB first
await connectDB();
console.log(`Registering ${functions.length} Inngest functions:`, functions.map(f => f.id || 'unnamed'));

// --- IMPORTANT: Stripe webhook route FIRST ---
// Stripe needs raw body for signature verification
app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhooks
);

// ✅ Then JSON body parser for all other routes
app.use(express.json());

// ✅ CORS for frontend requests (not webhook)
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://quickshow-ashen-alpha.vercel.app/admin']
        : ['http://localhost:3000', 'http://localhost:5173'],
  })
);

// ✅ Clerk auth middleware
app.use(clerkMiddleware());

// --- ROUTES ---
app.get('/', (req, res) => res.send('Server is Live!'));
app.use('/api/show', showRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// ✅ Inngest route
app.use(
  '/api/inngest',
  serve({
    client: inngest,
    functions,
  })
);

// ✅ Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ✅ Local dev listener
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

// ✅ For Vercel or Next.js serverless — disable built-in body parser for webhooks
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default app;

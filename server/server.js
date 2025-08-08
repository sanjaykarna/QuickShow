import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';

const app = express();
const port = 3000;

// Initialize database connection
await connectDB();

// Debug: Log functions
console.log(`Registering ${functions.length} Inngest functions:`, 
  functions.map(f => f.id || 'unnamed'));

// *** IMPORTANT ***
// Add express.raw() middleware BEFORE inngest serve middleware
app.use('/api/inngest', express.raw({ type: '*/*' }));

// Inngest route to handle function invocations
app.use('/api/inngest', serve({ 
  client: inngest, 
  functions,
  serveHost: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  servePath: '/api/inngest'
}));

// Stripe webhook route needs raw body
app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// After raw body middleware and Inngest routes, add JSON parser and CORS
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Replace with your frontend domain
    : ['http://localhost:3000', 'http://localhost:5173'] // Dev origins
}));

app.use(clerkMiddleware());

// API routes
app.get('/', (req, res) => res.send('Server is Live!'));
app.use('/api/show', showRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start local server only in development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

// Export app for Vercel
export default app;

// Vercel API config to disable built-in body parser
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  }
};

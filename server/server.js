import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"

const app = express();

await connectDB()

//Middleware
app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

//API Routes
app.get('/', (req, res)=>res.send('Server is Live!'))
app.use('/api/inngest', serve({ client: inngest, functions }))

// Remove this line - Vercel handles the server
// app.listen(port, ()=>console.log(`Server Listening at http://localhost:${port}`));

// Export the app for Vercel
export default app;
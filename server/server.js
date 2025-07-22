import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';

const app = express();
const port = 3000;

await connectDB()

//Middleware
app.use(express.json())
app.use(cors())


//API Routes
app.get('/', (req, res)=>res.send('Server is Live!'))

app.listen(port, ()=>console.log(`Server Listening at http://localhost:${port}`));
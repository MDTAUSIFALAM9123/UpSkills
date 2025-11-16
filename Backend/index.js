import express from 'express';
import { config } from 'dotenv';
config();
import connectionToDB from './config/dbConnection.js';
import userRouter from './routes/user.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import courseRouter from './routes/course.route.js';

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);
app.use(cookieParser());
const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.send('This is home page');
});

app.use('/api', userRouter);
app.use('/api/courses', courseRouter);

app.listen(PORT, async () => {
  await connectionToDB();
  console.log(`server running on http://localhost:${PORT}`);
});

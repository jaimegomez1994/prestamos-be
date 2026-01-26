import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const row = await prisma.dummy.findFirst();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      dbRow: row
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

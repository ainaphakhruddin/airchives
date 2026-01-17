import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import uploadRoutes from './routes/upload';
import garmentRoutes from './routes/garments';
import generationRoutes from './routes/generation';

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/upload', uploadRoutes);
app.use('/api/garments', garmentRoutes);
app.use('/api/generate', generationRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Airchives API server running on port ${PORT}`);
});

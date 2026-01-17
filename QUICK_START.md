import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

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
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Airchives API is running (simple mode)',
    nodeVersion: process.version
  });
});

// Test upload route (without database)
app.post('/api/test-upload', (req, res) => {
  try {
    const { test } = req.body;
    res.json({
      success: true,
      message: 'Test endpoint working',
      received: test,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Test endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mock garment endpoints
app.get('/api/garments', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'test-garment-1',
        originalImageUrl: 'https://via.placeholder.com/400x600.png?text=Test+Garment',
        category: 'TOP',
        status: 'SEGMENTED',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/garments/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: {
      id,
      originalImageUrl: 'https://via.placeholder.com/400x600.png?text=Garment+' + id,
      category: 'TOP',
      status: 'SEGMENTED',
      maskImageUrl: 'https://via.placeholder.com/400x600.png?text=Mask+' + id,
      createdAt: new Date().toISOString()
    }
  });
});

// Mock generation endpoints
app.post('/api/generate', (req, res) => {
  try {
    const { garmentId, targetModelId, background, poses } = req.body;
    
    res.json({
      success: true,
      data: {
        generationId: 'test-gen-' + Date.now(),
        status: 'pending',
        estimatedTime: 30,
        message: 'Mock generation started',
        input: { garmentId, targetModelId, background, poses }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/generate/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: {
      id,
      status: 'completed',
      progress: 100,
      images: [
        {
          id: 'test-img-1',
          url: 'https://via.placeholder.com/1024x1024.png?text=Generated+1',
          aspectRatio: 'SQUARE',
          isFavorite: false,
          downloadCount: 0
        },
        {
          id: 'test-img-2', 
          url: 'https://via.placeholder.com/1024x1024.png?text=Generated+2',
          aspectRatio: 'SQUARE',
          isFavorite: false,
          downloadCount: 0
        }
      ],
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Airchives API (Simple Mode) running on port ${PORT}`);
  console.log(`📊 Test endpoints available:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/garments`);
  console.log(`   POST http://localhost:${PORT}/api/generate`);
});

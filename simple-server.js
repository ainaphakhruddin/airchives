// Simple test server that works with Node.js 12
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Airchives API is running (simple mode)',
    nodeVersion: process.version
  });
});

// Test garment endpoints
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
      message: error.message || 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Airchives API (Simple Mode) running on port ${PORT}`);
  console.log(`📊 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/garments`);
  console.log(`   POST http://localhost:${PORT}/api/generate`);
});

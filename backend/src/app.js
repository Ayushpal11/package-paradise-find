import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDB } from './db.js';
import packageRoutes from './routes/packages.js';
import enquiryRoutes from './routes/enquiries.js';
import scraperRoutes from './routes/scraper.js';
import tourRoutes from './routes/tours.js';
import priceHistoryRoutes from './routes/priceHistory.js';
import aiRoutes from './routes/ai.js';
import { HttpError } from './utils/asyncHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (ms > 1000) {
      console.warn(`⚠️ Slow request: ${req.method} ${req.path} - ${ms}ms`);
    }
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint with API info
app.get('/', (req, res) => {
  res.json({
    name: 'Package Paradise API',
    version: '1.0.0',
    endpoints: [
      '/api/packages',
      '/api/fetch-tours',
      '/api/enquiries',
      '/api/scraper',
      '/api/ai',
    ],
    docs: 'https://github.com/your-org/package-paradise-find',
  });
});

// API Routes
app.use('/api/packages', packageRoutes);
app.use('/api/packages', priceHistoryRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/fetch-tours', tourRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // PostgreSQL errors
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      error: 'Database constraint violation',
      detail: err.detail || err.message,
    });
  }

  // Default 500
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;


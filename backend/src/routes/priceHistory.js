import express from 'express';
import {
  getPackagePriceHistory,
  addPriceSnapshot,
  getPriceDropAlerts,
} from '../controllers/tourController.js';

const router = express.Router();

// Price drop alerts (put before :id routes to avoid conflict)
router.get('/price-drops', getPriceDropAlerts);

// Per-package price history
router.get('/:id/price-history', getPackagePriceHistory);
router.post('/:id/price-history', addPriceSnapshot);

export default router;

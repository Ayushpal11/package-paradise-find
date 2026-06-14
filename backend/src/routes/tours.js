import express from 'express';
import {
  fetchTours,
  getRecentFetchedTours,
  getFetchedTourById,
  getPriceDropAlerts
} from '../controllers/tourController.js';

const router = express.Router();

// Search internet for planned tours
router.get('/', fetchTours);

// Get previously fetched tours from DB
router.get('/recent', getRecentFetchedTours);

// Get single fetched tour details
router.get('/:id', getFetchedTourById);

// Get price drop alerts
router.get('/price-drop-alerts', getPriceDropAlerts);

export default router;

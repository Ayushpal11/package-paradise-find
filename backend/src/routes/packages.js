import express from 'express';
import {
  searchPackages,
  getPackageById,
  getPackagesByVendor,
  getPackagePriceHistory,
  getPriceDropAlerts,
} from '../controllers/packageController.js';

const router = express.Router();

// Price drop alerts (put before :id routes to avoid conflict)
router.get('/price-drops', getPriceDropAlerts);

// Search packages with filters
router.get('/', searchPackages);

// Get single package details
router.get('/:id', getPackageById);

// Get price history for a package
router.get('/:id/price-history', getPackagePriceHistory);

// Get packages by vendor (optional endpoint)
router.get('/vendor/:vendorId', getPackagesByVendor);

export default router;


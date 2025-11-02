import express from 'express';
import {
  searchPackages,
  getPackageById,
  getPackagesByVendor,
} from '../controllers/packageController.js';

const router = express.Router();

// Search packages with filters
router.get('/', searchPackages);

// Get single package details
router.get('/:id', getPackageById);

// Get packages by vendor (optional endpoint)
router.get('/vendor/:vendorId', getPackagesByVendor);

export default router;


import express from 'express';
import {
  submitEnquiry,
  getEnquiries,
  getEnquiryById,
} from '../controllers/enquiryController.js';

const router = express.Router();

// Submit new enquiry
router.post('/', submitEnquiry);

// Get all enquiries (admin endpoint)
router.get('/', getEnquiries);

// Get single enquiry (admin endpoint)
router.get('/:id', getEnquiryById);

export default router;


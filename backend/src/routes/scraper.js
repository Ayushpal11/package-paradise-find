import express from 'express';
import {
  scrapeSingleUrl,
  scrapeMultipleUrls,
  scrapeAllConfigured,
  getVendors,
  getScrapingStatus,
} from '../controllers/scraperController.js';

const router = express.Router();

// Scrape a single URL
router.post('/scrape', scrapeSingleUrl);

// Scrape multiple URLs
router.post('/scrape-multiple', scrapeMultipleUrls);

// Scrape all configured websites from scraperConfig.js
router.post('/scrape-all', scrapeAllConfigured);

// Get list of vendors
router.get('/vendors', getVendors);

// Get scraping status
router.get('/status', getScrapingStatus);

export default router;


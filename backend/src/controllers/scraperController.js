import { query } from '../db.js';
import { scrapeWebsite, scrapeMultipleWebsites } from '../services/scraperService.js';
import { scrapeAllWebsites } from '../utils/scheduledScraper.js';
import { asyncHandler, BadRequest } from '../utils/asyncHandler.js';
import { validateRequired, validateURL, sanitizeString, parseNumber } from '../utils/validation.js';

/**
 * Scrape packages from a single website URL
 * POST /api/scraper/scrape
 * Body: { url: string, vendorId?: number, vendorName?: string }
 */
export const scrapeSingleUrl = asyncHandler(async (req, res) => {
  const { url, vendorId, vendorName } = req.body;

  validateRequired(req.body, ['url']);

  // Validate URL
  if (!validateURL(url)) {
    throw BadRequest('Invalid URL format');
  }

  let finalVendorId = vendorId;

  // If vendorId not provided, try to find or create vendor by name
  if (!finalVendorId && vendorName) {
    const sanitizedVendorName = sanitizeString(vendorName, 255);
    let vendorResult = await query(
      'SELECT id FROM vendors WHERE name = $1',
      [sanitizedVendorName]
    );

    if (vendorResult.rows.length === 0) {
      // Create new vendor
      vendorResult = await query(
        `INSERT INTO vendors (name, type, website_url)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [sanitizedVendorName, 'OTA', url]
      );
    }

    finalVendorId = vendorResult.rows[0].id;
  }

  // If still no vendorId, create a default one
  if (!finalVendorId) {
    const domain = new URL(url).hostname;
    const defaultVendorName = domain.replace(/^www\./, '').split('.')[0];

    let vendorResult = await query(
      'SELECT id FROM vendors WHERE name = $1',
      [defaultVendorName]
    );

    if (vendorResult.rows.length === 0) {
      vendorResult = await query(
        `INSERT INTO vendors (name, type, website_url)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [defaultVendorName, 'OTA', url]
      );
    }

    finalVendorId = vendorResult.rows[0].id;
  }

  // Scrape the website
  const result = await scrapeWebsite(url, finalVendorId);

  if (result.success) {
    res.json({
      success: true,
      message: result.message,
      data: {
        url,
        vendorId: finalVendorId,
        stats: result.stats,
        packages: result.packages,
      },
    });
  } else {
    res.status(400).json({
      success: false,
      message: result.message,
      data: {
        url,
        packages: result.packages,
      },
    });
  }
});

/**
 * Scrape packages from multiple URLs
 * POST /api/scraper/scrape-multiple
 * Body: { urls: string[], vendorId?: number, vendorName?: string }
 */
export const scrapeMultipleUrls = asyncHandler(async (req, res) => {
  const { urls, vendorId, vendorName } = req.body;

  validateRequired(req.body, ['urls']);

  if (!Array.isArray(urls) || urls.length === 0) {
    throw BadRequest('URLs array is required');
  }

  // Validate URLs
  for (const url of urls) {
    if (!validateURL(url)) {
      throw BadRequest(`Invalid URL format: ${url}`);
    }
  }

  let finalVendorId = vendorId;

  // Handle vendor lookup/creation (same as single scrape)
  if (!finalVendorId && vendorName) {
    const sanitizedVendorName = sanitizeString(vendorName, 255);
    let vendorResult = await query(
      'SELECT id FROM vendors WHERE name = $1',
      [sanitizedVendorName]
    );

    if (vendorResult.rows.length === 0) {
      vendorResult = await query(
        `INSERT INTO vendors (name, type, website_url)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [sanitizedVendorName, 'OTA', urls[0]]
      );
    }

    finalVendorId = vendorResult.rows[0].id;
  }

  if (!finalVendorId) {
    const domain = new URL(urls[0]).hostname;
    const defaultVendorName = domain.replace(/^www\./, '').split('.')[0];

    let vendorResult = await query(
      'SELECT id FROM vendors WHERE name = $1',
      [defaultVendorName]
    );

    if (vendorResult.rows.length === 0) {
      vendorResult = await query(
        `INSERT INTO vendors (name, type, website_url)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [defaultVendorName, 'OTA', urls[0]]
      );
    }

    finalVendorId = vendorResult.rows[0].id;
  }

  // Scrape all URLs
  const results = await scrapeMultipleWebsites(urls, finalVendorId);

  const totalStats = {
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
  };

  results.forEach(result => {
    if (result.success && result.stats) {
      totalStats.total += result.stats.total;
      totalStats.created += result.stats.created;
      totalStats.updated += result.stats.updated;
    } else {
      totalStats.failed++;
    }
  });

  res.json({
    success: true,
    message: `Scraped ${urls.length} websites. Total: ${totalStats.total} packages (${totalStats.created} created, ${totalStats.updated} updated)`,
    data: {
      vendorId: finalVendorId,
      totalStats,
      results,
    },
  });
});

/**
 * Scrape all configured websites from scraperConfig.js
 * POST /api/scraper/scrape-all
 * This endpoint scrapes all websites configured in backend/src/config/scraperConfig.js
 */
export const scrapeAllConfigured = asyncHandler(async (req, res) => {
  // Run scraping in background
  scrapeAllWebsites().catch(error => {
    console.error('Error in scheduled scrape:', error);
  });

  res.json({
    success: true,
    message: 'Scraping started for all configured websites. Check server logs for progress.',
  });
});

/**
 * Get list of all vendors
 * GET /api/scraper/vendors
 */
export const getVendors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const pageNum = Math.max(1, parseNumber(page, 1));
  const limitNum = Math.min(100, Math.max(1, parseNumber(limit, 50)));
  const offset = (pageNum - 1) * limitNum;

  const [vendorsResult, countResult] = await Promise.all([
    query(
      'SELECT id, name, type, website_url, rating FROM vendors ORDER BY name LIMIT $1 OFFSET $2',
      [limitNum, offset]
    ),
    query('SELECT COUNT(*) as count FROM vendors'),
  ]);

  res.json({
    success: true,
    vendors: vendorsResult.rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: parseInt(countResult.rows[0].count),
      pages: Math.ceil(parseInt(countResult.rows[0].count) / limitNum),
    },
  });
});

/**
 * Get scraping status/history
 * GET /api/scraper/status
 */
export const getScrapingStatus = asyncHandler(async (req, res) => {
  // Get recent packages count
  const recentPackages = await query(
    `SELECT COUNT(*) as count,
            MAX(created_at) as last_created,
            MAX(updated_at) as last_updated
     FROM packages
     WHERE created_at > NOW() - INTERVAL '24 hours' OR updated_at > NOW() - INTERVAL '24 hours'`
  );

  // Get total packages count
  const totalPackages = await query('SELECT COUNT(*) as count FROM packages');

  // Get vendors count
  const vendorsCount = await query('SELECT COUNT(*) as count FROM vendors');

  res.json({
    success: true,
    status: {
      totalPackages: parseInt(totalPackages.rows[0].count),
      recentPackages: parseInt(recentPackages.rows[0].count),
      lastCreated: recentPackages.rows[0].last_created,
      lastUpdated: recentPackages.rows[0].last_updated,
      totalVendors: parseInt(vendorsCount.rows[0].count),
    },
  });
});
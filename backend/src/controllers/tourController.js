import { fetchPlannedTours, fetchGlobalTours } from '../services/tourFetcherService.js';
import { getPriceHistory, getPriceSummary, getPriceDrops, recordPrice } from '../services/priceTrackingService.js';
import { query } from '../db.js';
import { asyncHandler, BadRequest, NotFound } from '../utils/asyncHandler.js';
import { validateRequired, parseNumber, sanitizeString } from '../utils/validation.js';

/**
 * GET /api/fetch-tours?destination=Bali&origin=Delhi&fetchDetails=false
 * Searches the internet for planned / fixed-departure tours.
 */
export const fetchTours = asyncHandler(async (req, res) => {
  const { destination, origin, fetchDetails } = req.query;

  if (!destination) {
    throw BadRequest('destination query param is required');
  }

  const result = await fetchPlannedTours(
    destination,
    origin || null,
    fetchDetails === 'true'
  );
  res.json({ success: true, ...result });
});

/**
 * GET /api/fetch-tours/recent?destination=Bali&limit=20
 * Returns recently fetched tours from DB. Triggers global fetch if empty.
 */
export const getRecentFetchedTours = asyncHandler(async (req, res) => {
  const { destination, limit = 20 } = req.query;

  const limitNum = Math.min(100, Math.max(1, parseNumber(limit, 20)));

  let sql = `SELECT * FROM fetched_tours`;
  const params = [];
  if (destination) {
    params.push(`%${destination}%`);
    sql += ` WHERE LOWER(destination) LIKE LOWER($1)`;
  }
  sql += ` ORDER BY fetched_at DESC LIMIT $${params.length + 1}`;
  params.push(limitNum);

  const result = await query(sql, params);

  // If no tours found and no destination filter, trigger a background global fetch
  if (result.rows.length === 0 && !destination) {
    console.log('No tours in DB, triggering global discovery...');
    fetchGlobalTours().catch(e => console.error('Global fetch failed:', e));
  }

  res.json({ success: true, tours: result.rows });
});

/**
 * GET /api/packages/:id/price-history
 * Returns price snapshot history for a package.
 */
export const getPackagePriceHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 50 } = req.query;

  if (!id || isNaN(parseInt(id))) {
    throw BadRequest('Invalid package ID');
  }

  const limitNum = Math.min(200, Math.max(1, parseNumber(limit, 50)));

  const [history, summary] = await Promise.all([
    getPriceHistory(id, limitNum),
    getPriceSummary(id),
  ]);
  res.json({ success: true, packageId: id, summary, history });
});

/**
 * POST /api/packages/:id/price-history
 * Manually record a price snapshot.
 * Body: { price, currency?, source?, tourStartDate?, tourEndDate? }
 */
export const addPriceSnapshot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { price, currency, source, tourStartDate, tourEndDate } = req.body;

  if (!price) {
    throw BadRequest('price is required');
  }

  const priceNum = parseNumber(price);
  if (!priceNum || priceNum <= 0) {
    throw BadRequest('Invalid price value');
  }

  const sanitizedCurrency = currency ? sanitizeString(currency, 10) : '₹';
  const sanitizedSource = source ? sanitizeString(source, 100) : 'manual';

  const row = await recordPrice(id, priceNum, {
    currency: sanitizedCurrency,
    source: sanitizedSource,
    tourStartDate,
    tourEndDate,
  });
  res.json({ success: true, snapshot: row });
});

/**
 * GET /api/fetch-tours/:id
 * Get details for a single fetched tour.
 */
export const getFetchedTourById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    throw BadRequest('Invalid tour ID');
  }

  const result = await query(`SELECT * FROM fetched_tours WHERE id = $1`, [id]);
  if (result.rows.length === 0) {
    throw NotFound('Tour not found');
  }
  res.json({ success: true, tour: result.rows[0] });
});


export const getPriceDropAlerts = asyncHandler(async (req, res) => {
  const { threshold = 5 } = req.query;

  const thresholdNum = parseNumber(threshold, 5);
  if (!thresholdNum || thresholdNum <= 0) {
    throw BadRequest('Invalid threshold value');
  }

  const alerts = await getPriceDrops(thresholdNum);
  res.json({ success: true, alerts });
});

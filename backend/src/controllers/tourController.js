import { fetchPlannedTours, fetchGlobalTours } from '../services/tourFetcherService.js';
import { getPriceHistory, getPriceSummary, getPriceDrops, recordPrice } from '../services/priceTrackingService.js';
import { query } from '../db.js';

/**
 * GET /api/fetch-tours?destination=Bali&origin=Delhi&fetchDetails=false
 * Searches the internet for planned / fixed-departure tours.
 */
export const fetchTours = async (req, res) => {
  const { destination, origin, fetchDetails } = req.query;

  if (!destination) {
    return res.status(400).json({ error: 'destination query param is required' });
  }

  try {
    const result = await fetchPlannedTours(
      destination,
      origin || null,
      fetchDetails === 'true'
    );
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('fetchTours error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/fetch-tours/recent?destination=Bali&limit=20
 * Returns recently fetched tours from DB. Triggers global fetch if empty.
 */
export const getRecentFetchedTours = async (req, res) => {
  const { destination, limit = 20 } = req.query;
  try {
    let sql = `SELECT * FROM fetched_tours`;
    const params = [];
    if (destination) {
      sql += ` WHERE LOWER(destination) LIKE LOWER($1)`;
      params.push(`%${destination}%`);
    }
    sql += ` ORDER BY fetched_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await query(sql, params);
    
    // If no tours found and no destination filter, trigger a background global fetch
    if (result.rows.length === 0 && !destination) {
      console.log('No tours in DB, triggering global discovery...');
      fetchGlobalTours().catch(e => console.error('Global fetch failed:', e));
    }

    res.json({ success: true, tours: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/packages/:id/price-history
 * Returns price snapshot history for a package.
 */
export const getPackagePriceHistory = async (req, res) => {
  const { id } = req.params;
  const { limit = 50 } = req.query;
  try {
    const [history, summary] = await Promise.all([
      getPriceHistory(id, parseInt(limit)),
      getPriceSummary(id),
    ]);
    res.json({ success: true, packageId: id, summary, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/packages/:id/price-history
 * Manually record a price snapshot.
 * Body: { price, currency?, source?, tourStartDate?, tourEndDate? }
 */
export const addPriceSnapshot = async (req, res) => {
  const { id } = req.params;
  const { price, currency, source, tourStartDate, tourEndDate } = req.body;

  if (!price) return res.status(400).json({ error: 'price is required' });

  try {
    const row = await recordPrice(id, price, { currency, source, tourStartDate, tourEndDate });
    res.json({ success: true, snapshot: row });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/fetch-tours/:id
 * Get details for a single fetched tour.
 */
export const getFetchedTourById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(`SELECT * FROM fetched_tours WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getPriceDropAlerts = async (req, res) => {
  try {
    const alerts = await getPriceDrops();
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

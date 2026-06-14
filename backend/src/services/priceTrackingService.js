/**
 * Price Tracking Service
 * Records price snapshots for packages over time and fetches price history.
 */

import { query } from '../db.js';

/**
 * Record a price snapshot for a package.
 * Call this whenever a package price is fetched/scraped.
 */
export async function recordPrice(packageId, price, options = {}) {
  const { currency = '₹', source = null, tourStartDate = null, tourEndDate = null, availability = null } = options;

  const result = await query(
    `INSERT INTO price_history
       (package_id, price, currency, source, tour_start_date, tour_end_date, availability)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [packageId, price, currency, source, tourStartDate, tourEndDate, availability]
  );
  return result.rows[0];
}

/**
 * Get full price history for a package, newest first.
 */
export async function getPriceHistory(packageId, limit = 50) {
  const result = await query(
    `SELECT * FROM price_history
     WHERE package_id = $1
     ORDER BY recorded_at DESC
     LIMIT $2`,
    [packageId, limit]
  );
  return result.rows;
}

/**
 * Get price summary for a package: current, min, max, trend.
 */
export async function getPriceSummary(packageId) {
  const result = await query(
    `SELECT
       COUNT(*)                          AS snapshots,
       MIN(price)                        AS min_price,
       MAX(price)                        AS max_price,
       AVG(price)::NUMERIC(10,2)         AS avg_price,
       (SELECT price FROM price_history WHERE package_id=$1 ORDER BY recorded_at DESC LIMIT 1) AS current_price,
       (SELECT price FROM price_history WHERE package_id=$1 ORDER BY recorded_at ASC  LIMIT 1) AS first_price,
       MIN(recorded_at)                  AS first_recorded,
       MAX(recorded_at)                  AS last_recorded
     FROM price_history
     WHERE package_id = $1`,
    [packageId]
  );
  const row = result.rows[0];
  const trend = row.current_price && row.first_price
    ? row.current_price > row.first_price ? 'up'
    : row.current_price < row.first_price ? 'down' : 'stable'
    : 'unknown';

  return { ...row, trend };
}

/**
 * Bulk-record prices for all packages from a scrape run.
 * packages: [{ id, price, currency?, source? }]
 */
export async function bulkRecordPrices(packages, source = 'scraper') {
  const saved = [];
  for (const pkg of packages) {
    if (!pkg.id || !pkg.price) continue;
    try {
      const row = await recordPrice(pkg.id, pkg.price, {
        currency:      pkg.currency,
        source,
        tourStartDate: pkg.tour_start_date || null,
        tourEndDate:   pkg.tour_end_date   || null,
      });
      saved.push(row);
    } catch (err) {
      console.error(`Failed to record price for package ${pkg.id}:`, err.message);
    }
  }
  return saved;
}

/**
 * Get packages with significant price drops since last snapshot.
 */
export async function getPriceDrops(thresholdPercent = 5) {
  const result = await query(
    `SELECT
       p.id, p.title, p.destination,
       ph_new.price AS current_price,
       ph_old.price AS previous_price,
       ROUND(((ph_old.price - ph_new.price) / ph_old.price) * 100, 1) AS drop_pct
     FROM packages p
     JOIN LATERAL (
       SELECT price FROM price_history WHERE package_id=p.id ORDER BY recorded_at DESC LIMIT 1
     ) ph_new ON true
     JOIN LATERAL (
       SELECT price FROM price_history WHERE package_id=p.id ORDER BY recorded_at DESC LIMIT 1 OFFSET 1
     ) ph_old ON true
     WHERE ph_old.price > 0
       AND ((ph_old.price - ph_new.price) / ph_old.price) * 100 >= $1
     ORDER BY drop_pct DESC`,
    [thresholdPercent]
  );
  return result.rows;
}

import { query } from '../db.js';
import { getPriceSummary, getPriceDrops } from '../services/priceTrackingService.js';
import { asyncHandler, BadRequest } from '../utils/asyncHandler.js';
import { cache, cacheKeys } from '../utils/cache.js';

// Search packages with filters
export const searchPackages = asyncHandler(async (req, res) => {
  const {
    origin,
    destination,
    startDate,
    endDate,
    travellers,
    sortBy = 'price',
    priceMin,
    priceMax,
    hotelStars,
    meals,
    transfers,
    refundable,
    nights,
  } = req.query;

  // Build cache key from query params
  const cacheKey = cacheKeys.packageSearch(req.query);
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Start building the query
  let sql = `
    SELECT
      p.*,
      v.name as vendor_name,
      v.type as vendor_type,
      v.logo_url as vendor_logo,
      v.contact_email as vendor_email,
      v.contact_phone as vendor_phone,
      v.website_url as vendor_website,
      v.rating as vendor_rating,
      CASE
        WHEN v.type = 'OTA' THEN true
        ELSE false
      END as is_ota
    FROM packages p
    INNER JOIN vendors v ON p.vendor_id = v.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 0;

  // Apply filters
  if (origin) {
    paramCount++;
    sql += ` AND LOWER(p.origin) LIKE LOWER($${paramCount})`;
    params.push(`%${origin}%`);
  }

  if (destination) {
    paramCount++;
    sql += ` AND LOWER(p.destination) LIKE LOWER($${paramCount})`;
    params.push(`%${destination}%`);
  }

  if (priceMin) {
    paramCount++;
    sql += ` AND p.price >= $${paramCount}`;
    params.push(parseFloat(priceMin));
  }

  if (priceMax) {
    paramCount++;
    sql += ` AND p.price <= $${paramCount}`;
    params.push(parseFloat(priceMax));
  }

  if (hotelStars) {
    const stars = Array.isArray(hotelStars) ? hotelStars : [hotelStars];
    paramCount++;
    sql += ` AND p.hotel_stars = ANY($${paramCount})`;
    params.push(stars.map(s => parseInt(s)));
  }

  if (meals === 'true') {
    sql += ` AND p.includes_meals = true`;
  }

  if (transfers === 'true') {
    sql += ` AND p.includes_transfers = true`;
  }

  if (refundable === 'true') {
    sql += ` AND p.refundable = true`;
  }

  if (nights) {
    const nightValues = Array.isArray(nights) ? nights : [nights];
    paramCount++;
    sql += ` AND CAST(SPLIT_PART(p.duration, 'N', 1) AS INTEGER) = ANY($${paramCount})`;
    params.push(nightValues.map(n => parseInt(n)));
  }

  // Sorting
  const validSortBy = ['price', 'rating', 'duration', 'price-desc'];
  const sortField = validSortBy.includes(sortBy) ? sortBy : 'price';

  switch (sortField) {
    case 'price':
      sql += ` ORDER BY p.price ASC`;
      break;
    case 'price-desc':
      sql += ` ORDER BY p.price DESC`;
      break;
    case 'rating':
      sql += ` ORDER BY p.rating DESC`;
      break;
    case 'duration':
      sql += ` ORDER BY CAST(SPLIT_PART(p.duration, 'N', 1) AS INTEGER) ASC`;
      break;
  }

  const result = await query(sql, params);

  // Get price drops for these packages
  const packageIds = result.rows.map(r => r.id);
  let priceDropMap = new Map();
  if (packageIds.length > 0) {
    // Get price drops for all packages in the results
    const dropsResult = await query(
      `SELECT
         p.id,
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
       WHERE p.id = ANY($1)
         AND ph_old.price > 0
         AND ((ph_old.price - ph_new.price) / ph_old.price) * 100 >= 5
       ORDER BY drop_pct DESC`,
      [packageIds]
    );

    dropsResult.rows.forEach(row => {
      priceDropMap.set(row.id, {
        priceDrop: row.drop_pct,
        originalPrice: parseFloat(row.previous_price),
        currentPrice: parseFloat(row.current_price)
      });
    });
  }

  // Transform the data to match frontend expectations
  const packages = result.rows.map(row => {
    const dropInfo = priceDropMap.get(row.id) || null;
    return {
      id: row.id.toString(),
      title: row.title,
      destination: row.destination,
      duration: row.duration,
      price: parseFloat(row.price),
      currency: row.currency || '₹',
      vendor: row.vendor_name,
      vendorLogo: row.vendor_logo,
      rating: parseFloat(row.rating) || 0,
      hotelStars: row.hotel_stars || 0,
      inclusions: {
        flights: row.includes_flights || false,
        hotels: row.includes_hotels || false,
        transfers: row.includes_transfers || false,
        meals: row.includes_meals || false,
        sightseeing: row.includes_sightseeing || false,
      },
      image: row.image_url || row.images?.[0] || '',
      refundable: row.refundable || false,
      isOTA: row.is_ota || false,
      highlights: row.highlights || [],
      itinerary: row.itinerary || [],
      hotelInfo: row.hotel_info || {},
      flightInfo: row.flight_info || {},
      // Price drop info for badge
      ...(dropInfo && { priceDrop: dropInfo.priceDrop, originalPrice: dropInfo.originalPrice })
    };
  });

  // Cache for 30 seconds
  cache.set(cacheKey, packages, 30000);

  res.json(packages);
});

// Get single package by ID
export const getPackageById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    throw BadRequest('Invalid package ID');
  }

  const result = await query(
    `
    SELECT
      p.*,
      v.name as vendor_name,
      v.type as vendor_type,
      v.logo_url as vendor_logo,
      v.contact_email as vendor_email,
      v.contact_phone as vendor_phone,
      v.website_url as vendor_website,
      v.rating as vendor_rating,
      CASE
        WHEN v.type = 'OTA' THEN true
        ELSE false
      END as is_ota
    FROM packages p
    INNER JOIN vendors v ON p.vendor_id = v.id
    WHERE p.id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Package not found' });
  }

  const row = result.rows[0];
  const packageData = {
    id: row.id.toString(),
    title: row.title,
    destination: row.destination,
    duration: row.duration,
    price: parseFloat(row.price),
    currency: row.currency || '₹',
    vendor: row.vendor_name,
    vendorLogo: row.vendor_logo,
    rating: parseFloat(row.rating) || 0,
    hotelStars: row.hotel_stars || 0,
    inclusions: {
      flights: row.includes_flights || false,
      hotels: row.includes_hotels || false,
      transfers: row.includes_transfers || false,
      meals: row.includes_meals || false,
      sightseeing: row.includes_sightseeing || false,
    },
    image: row.image_url || row.images?.[0] || '',
    images: row.images || [],
    refundable: row.refundable || false,
    isOTA: row.is_ota || false,
    highlights: row.highlights || [],
    itinerary: row.itinerary || [],
    hotelInfo: row.hotel_info || {},
    flightInfo: row.flight_info || {},
  };

  res.json(packageData);
});

// Get packages by vendor
export const getPackagesByVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  if (!vendorId || isNaN(parseInt(vendorId))) {
    throw BadRequest('Invalid vendor ID');
  }

  const result = await query(
    `
    SELECT
      p.*,
      v.name as vendor_name,
      v.type as vendor_type,
      v.logo_url as vendor_logo,
      v.contact_email as vendor_email,
      v.contact_phone as vendor_phone,
      v.website_url as vendor_website,
      v.rating as vendor_rating,
      CASE
        WHEN v.type = 'OTA' THEN true
        ELSE false
      END as is_ota
    FROM packages p
    INNER JOIN vendors v ON p.vendor_id = v.id
    WHERE p.vendor_id = $1
    ORDER BY p.price ASC
    `,
    [vendorId]
  );

  const packages = result.rows.map(row => ({
    id: row.id.toString(),
    title: row.title,
    destination: row.destination,
    duration: row.duration,
    price: parseFloat(row.price),
    currency: row.currency || '₹',
    vendor: row.vendor_name,
    vendorLogo: row.vendor_logo,
    rating: parseFloat(row.rating) || 0,
    hotelStars: row.hotel_stars || 0,
    inclusions: {
      flights: row.includes_flights || false,
      hotels: row.includes_hotels || false,
      transfers: row.includes_transfers || false,
      meals: row.includes_meals || false,
      sightseeing: row.includes_sightseeing || false,
    },
    image: row.image_url || row.images?.[0] || '',
    refundable: row.refundable || false,
    isOTA: row.is_ota || false,
    highlights: row.highlights || [],
    itinerary: row.itinerary || [],
    hotelInfo: row.hotel_info || {},
    flightInfo: row.flight_info || {},
  }));

  res.json(packages);
});

// Get price history for a package
export const getPackagePriceHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 50 } = req.query;

  if (!id || isNaN(parseInt(id))) {
    throw BadRequest('Invalid package ID');
  }

  const [history, summary] = await Promise.all([
    query(
      `SELECT * FROM price_history
       WHERE package_id = $1
       ORDER BY recorded_at DESC
       LIMIT $2`,
      [id, parseInt(limit)]
    ),
    getPriceSummary(id),
  ]);

  res.json({ success: true, packageId: id, summary, history: history.rows });
});

// Get all price drop alerts
export const getPriceDropAlerts = asyncHandler(async (req, res) => {
  const { threshold = 5 } = req.query;

  const cacheKey = cacheKeys.priceDrops(threshold);
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const alerts = await getPriceDrops(parseFloat(threshold));
  const response = { success: true, alerts };

  // Cache for 5 minutes
  cache.set(cacheKey, response, 5 * 60 * 1000);

  res.json(response);
});

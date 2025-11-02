import { query } from '../db.js';

// Search packages with filters
export const searchPackages = async (req, res) => {
  try {
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

    // Transform the data to match frontend expectations
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
  } catch (error) {
    console.error('Error searching packages:', error);
    res.status(500).json({ error: 'Failed to search packages' });
  }
};

// Get single package by ID
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

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
  } catch (error) {
    console.error('Error getting package:', error);
    res.status(500).json({ error: 'Failed to get package' });
  }
};

// Get packages by vendor
export const getPackagesByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

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
  } catch (error) {
    console.error('Error getting packages by vendor:', error);
    res.status(500).json({ error: 'Failed to get packages by vendor' });
  }
};


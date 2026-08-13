import { query } from '../db.js';
import { asyncHandler, BadRequest } from '../utils/asyncHandler.js';
import { validateRequired, validateEmail, validatePhone, sanitizeString, parseNumber } from '../utils/validation.js';

// Submit enquiry
export const submitEnquiry = asyncHandler(async (req, res) => {
  const { packageId, name, email, phone, travellers, message } = req.body;

  // Validation
  validateRequired(req.body, ['packageId', 'name', 'email', 'phone', 'travellers']);

  if (!validateEmail(email)) {
    throw BadRequest('Invalid email format');
  }

  if (!validatePhone(phone)) {
    throw BadRequest('Invalid phone number format');
  }

  const travellersNum = parseNumber(travellers);
  if (!travellersNum || travellersNum < 1 || travellersNum > 20) {
    throw BadRequest('Travellers must be between 1 and 20');
  }

  // Sanitize inputs
  const sanitizedName = sanitizeString(name, 255);
  const sanitizedEmail = sanitizeString(email, 255);
  const sanitizedPhone = sanitizeString(phone, 50);
  const sanitizedMessage = message ? sanitizeString(message, 2000) : null;

  // Verify package exists
  const pkgCheck = await query('SELECT id FROM packages WHERE id = $1', [packageId]);
  if (pkgCheck.rows.length === 0) {
    throw BadRequest('Package not found');
  }

  // Insert enquiry
  const result = await query(
    `
    INSERT INTO enquiries (package_id, name, email, phone, travellers, message, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING *
    `,
    [packageId, sanitizedName, sanitizedEmail, sanitizedPhone, travellersNum, sanitizedMessage]
  );

  res.status(201).json({
    success: true,
    message: 'Enquiry submitted successfully',
    enquiry: result.rows[0],
  });
});

// Get all enquiries (admin)
export const getEnquiries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  let whereClause = '';
  const params = [];

  if (status) {
    params.push(status);
    whereClause = `WHERE e.status = $${params.length}`;
  }

  const result = await query(`
    SELECT
      e.*,
      p.title as package_title,
      p.destination,
      v.name as vendor_name
    FROM enquiries e
    LEFT JOIN packages p ON e.package_id = p.id
    LEFT JOIN vendors v ON p.vendor_id = v.id
    ${whereClause}
    ORDER BY e.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `, [...params, limitNum, offset]);

  // Get total count
  const countResult = await query(`
    SELECT COUNT(*) FROM enquiries e ${whereClause}
  `, params);

  res.json({
    success: true,
    enquiries: result.rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: parseInt(countResult.rows[0].count),
      pages: Math.ceil(parseInt(countResult.rows[0].count) / limitNum),
    },
  });
});

// Get single enquiry (admin)
export const getEnquiryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    throw BadRequest('Invalid enquiry ID');
  }

  const result = await query(
    `
    SELECT
      e.*,
      p.title as package_title,
      p.destination,
      v.name as vendor_name
    FROM enquiries e
    LEFT JOIN packages p ON e.package_id = p.id
    LEFT JOIN vendors v ON p.vendor_id = v.id
    WHERE e.id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Enquiry not found' });
  }

  res.json({ success: true, enquiry: result.rows[0] });
});


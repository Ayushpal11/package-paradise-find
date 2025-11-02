import { query } from '../db.js';

// Submit enquiry
export const submitEnquiry = async (req, res) => {
  try {
    const { packageId, name, email, phone, travellers, message } = req.body;

    // Validation
    if (!packageId || !name || !email || !phone || !travellers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert enquiry
    const result = await query(
      `
      INSERT INTO enquiries (package_id, name, email, phone, travellers, message, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
      `,
      [packageId, name, email, phone, parseInt(travellers), message || null]
    );

    res.status(201).json({
      message: 'Enquiry submitted successfully',
      enquiry: result.rows[0],
    });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
};

// Get all enquiries (admin)
export const getEnquiries = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        e.*,
        p.title as package_title,
        p.destination,
        v.name as vendor_name
      FROM enquiries e
      LEFT JOIN packages p ON e.package_id = p.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      ORDER BY e.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting enquiries:', error);
    res.status(500).json({ error: 'Failed to get enquiries' });
  }
};

// Get single enquiry (admin)
export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;

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
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting enquiry:', error);
    res.status(500).json({ error: 'Failed to get enquiry' });
  }
};


import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Initialize database tables
export const initializeDB = async () => {
  try {
    console.log('📦 Initializing database tables...');

    // Create vendors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('OTA', 'Local')),
        logo_url TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        website_url TEXT,
        rating DECIMAL(3, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create packages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        origin VARCHAR(255),
        duration VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT '₹',
        vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
        rating DECIMAL(3, 2) DEFAULT 0,
        hotel_stars INTEGER CHECK (hotel_stars BETWEEN 1 AND 5),
        
        -- Inclusions
        includes_flights BOOLEAN DEFAULT false,
        includes_hotels BOOLEAN DEFAULT false,
        includes_transfers BOOLEAN DEFAULT false,
        includes_meals BOOLEAN DEFAULT false,
        includes_sightseeing BOOLEAN DEFAULT false,
        
        -- Additional info
        image_url TEXT,
        images TEXT[], -- Array of image URLs
        highlights TEXT[],
        itinerary JSONB,
        hotel_info JSONB,
        flight_info JSONB,
        refundable BOOLEAN DEFAULT false,
        terms_conditions TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create enquiries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        travellers INTEGER NOT NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_packages_destination ON packages(destination);
      CREATE INDEX IF NOT EXISTS idx_packages_price ON packages(price);
      CREATE INDEX IF NOT EXISTS idx_packages_vendor ON packages(vendor_id);
      CREATE INDEX IF NOT EXISTS idx_enquiries_package ON enquiries(package_id);
      CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};


import { query, initializeDB } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const vendors = [
  {
    name: 'TravelTriangle',
    type: 'OTA',
    contact_email: 'info@traveltriangle.com',
    contact_phone: '+91 1800 123 4567',
    website_url: 'https://www.traveltriangle.com',
    rating: 4.5,
  },
  {
    name: 'MakeMyTrip',
    type: 'OTA',
    contact_email: 'support@makemytrip.com',
    contact_phone: '+91 0124 4622 874',
    website_url: 'https://www.makemytrip.com',
    rating: 4.6,
  },
  {
    name: 'Yatra',
    type: 'OTA',
    contact_email: 'customercare@yatra.com',
    contact_phone: '+91 1800 123 4567',
    website_url: 'https://www.yatra.com',
    rating: 4.3,
  },
  {
    name: 'Local Paradise Tours',
    type: 'Local',
    contact_email: 'info@localparadisetours.com',
    contact_phone: '+91 98765 43210',
    website_url: null,
    rating: 4.8,
  },
  {
    name: 'Local Travel Experts',
    type: 'Local',
    contact_email: 'hello@localtravelexperts.com',
    contact_phone: '+91 98765 43211',
    website_url: null,
    rating: 4.4,
  },
];

const packages = [
  {
    title: 'Bali Paradise Escape',
    destination: 'Bali, Indonesia',
    origin: 'Delhi',
    duration: '5N/6D',
    price: 45000,
    currency: '₹',
    vendor_name: 'TravelTriangle',
    rating: 4.5,
    hotel_stars: 4,
    includes_flights: true,
    includes_hotels: true,
    includes_transfers: true,
    includes_meals: true,
    includes_sightseeing: true,
    image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2',
    ],
    highlights: [
      'Visit Tanah Lot Temple at sunset',
      'Water sports at Tanjung Benoa Beach',
      'Traditional Balinese dance performance',
      'Ubud Monkey Forest tour',
      'Rice terrace exploration',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Bali',
        description: 'Airport pickup and transfer to hotel. Evening at leisure. Welcome dinner included.',
      },
      {
        day: 2,
        title: 'Ubud Cultural Tour',
        description: 'Visit Ubud Monkey Forest, rice terraces, and art markets. Traditional lunch included.',
      },
      {
        day: 3,
        title: 'Water Sports & Beach Day',
        description: 'Full day at Tanjung Benoa with water sports activities. Beach sunset at Tanah Lot Temple.',
      },
      {
        day: 4,
        title: 'Island Exploration',
        description: 'Visit Besakih Temple, Tirta Gangga water palace, and local villages.',
      },
      {
        day: 5,
        title: 'Leisure Day',
        description: 'Free day for shopping, spa, or optional activities. Farewell dinner in the evening.',
      },
      {
        day: 6,
        title: 'Departure',
        description: 'Check out from hotel. Transfer to airport for your return flight.',
      },
    ],
    hotel_info: {
      name: 'Grand Bali Beach Resort',
      rating: 4,
      amenities: ['Pool', 'Spa', 'WiFi', 'Restaurant', 'Gym', 'Beach Access'],
    },
    flight_info: {
      airline: 'Air India',
      from: 'Delhi (DEL)',
      to: 'Bali (DPS)',
      class: 'Economy',
    },
    refundable: true,
  },
  {
    title: 'Maldives Honeymoon Special',
    destination: 'Maldives',
    origin: 'Mumbai',
    duration: '7N/8D',
    price: 89000,
    currency: '₹',
    vendor_name: 'Local Paradise Tours',
    rating: 4.8,
    hotel_stars: 5,
    includes_flights: true,
    includes_hotels: true,
    includes_transfers: true,
    includes_meals: true,
    includes_sightseeing: false,
    image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
    images: [
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
    ],
    highlights: [
      'Water villa accommodation',
      'Private beach access',
      'Sunset cruise experience',
      'Couples spa therapy',
      'Underwater restaurant dining',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Maldives',
        description: 'Speedboat transfer to resort. Check-in to water villa. Welcome drinks.',
      },
      {
        day: 2,
        title: 'Resort Activities',
        description: 'Snorkeling, water sports, and resort facilities. Beach dinner.',
      },
      {
        day: 3,
        title: 'Sunset Cruise',
        description: 'Romantic sunset cruise with dinner. Dolphin watching opportunity.',
      },
      {
        day: 4,
        title: 'Couples Spa',
        description: 'Relaxing couples spa session. Optional excursion to local islands.',
      },
      {
        day: 5,
        title: 'Water Activities',
        description: 'Diving, snorkeling, or water sports. Optional fishing trip.',
      },
      {
        day: 6,
        title: 'Underwater Dining',
        description: 'Unique underwater restaurant experience. Evening at leisure.',
      },
      {
        day: 7,
        title: 'Leisure Day',
        description: 'Free day to enjoy resort facilities. Farewell celebration.',
      },
      {
        day: 8,
        title: 'Departure',
        description: 'Check-out and transfer to airport for return flight.',
      },
    ],
    hotel_info: {
      name: 'Paradise Island Resort & Spa',
      rating: 5,
      amenities: ['Private Beach', 'Water Villa', 'Spa', 'Multiple Restaurants', 'Water Sports Center', 'Dive Center'],
    },
    flight_info: {
      airline: 'Emirates',
      from: 'Mumbai (BOM)',
      to: 'Malé (MLE)',
      class: 'Economy',
    },
    refundable: false,
  },
  {
    title: 'Dubai Luxury Experience',
    destination: 'Dubai, UAE',
    origin: 'Delhi',
    duration: '5N/6D',
    price: 55000,
    currency: '₹',
    vendor_name: 'MakeMyTrip',
    rating: 4.6,
    hotel_stars: 5,
    includes_flights: true,
    includes_hotels: true,
    includes_transfers: true,
    includes_meals: false,
    includes_sightseeing: true,
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
      'https://images.unsplash.com/photo-1532058221029-cb15ee9bca9d',
      'https://images.unsplash.com/photo-1601820505782-1c41f22f8aa2',
    ],
    highlights: [
      'Burj Khalifa observation deck',
      'Desert safari with BBQ dinner',
      'Dubai Marina cruise',
      'Aquaventure Waterpark access',
      'Gold Souk and Spice Souk visit',
    ],
    refundable: true,
  },
  {
    title: 'Thailand Adventure Tour',
    destination: 'Bangkok & Phuket',
    origin: 'Mumbai',
    duration: '6N/7D',
    price: 42000,
    currency: '₹',
    vendor_name: 'Yatra',
    rating: 4.3,
    hotel_stars: 3,
    includes_flights: true,
    includes_hotels: true,
    includes_transfers: true,
    includes_meals: true,
    includes_sightseeing: true,
    image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
    images: [
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
      'https://images.unsplash.com/photo-1539667547529-84b356501521',
      'https://images.unsplash.com/photo-1576867757603-05b134ebc379',
    ],
    highlights: [
      'Grand Palace and Wat Pho temples',
      'Thai cooking class experience',
      'Phi Phi Islands day tour',
      'Elephant sanctuary visit',
      'Floating markets exploration',
    ],
    refundable: false,
  },
  {
    title: 'Singapore Family Delight',
    destination: 'Singapore',
    origin: 'Bangalore',
    duration: '4N/5D',
    price: 38000,
    currency: '₹',
    vendor_name: 'Local Travel Experts',
    rating: 4.4,
    hotel_stars: 4,
    includes_flights: true,
    includes_hotels: true,
    includes_transfers: true,
    includes_meals: false,
    includes_sightseeing: true,
    image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
    images: [
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
      'https://images.unsplash.com/photo-1533309907656-0b7d798ddd89',
      'https://images.unsplash.com/photo-1499460931831-b430027f140c',
    ],
    highlights: [
      'Universal Studios Singapore',
      'Gardens by the Bay',
      'Sentosa Island activities',
      'Marina Bay Sands SkyPark',
      'Singapore Zoo & Night Safari',
    ],
    refundable: true,
  },
  {
    title: 'Switzerland Alpine Escape',
    destination: 'Zurich & Interlaken',
    origin: 'Delhi',
    duration: '7N/8D',
    price: 125000,
    currency: '₹',
    vendor_name: 'MakeMyTrip',
    rating: 4.7,
    hotel_stars: 4,
    includes_flights: true,
    includes_hotels: true,
    includes_transfers: true,
    includes_meals: true,
    includes_sightseeing: true,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    highlights: [
      'Jungfraujoch Top of Europe',
      'Interlaken adventure activities',
      'Zurich city tour',
      'Lake Lucerne cruise',
      'Swiss chocolate factory visit',
    ],
    refundable: true,
  },
  {
    title: 'Mauritius Island Paradise',
    destination: 'Mauritius',
    origin: 'Mumbai',
    duration: '6N/7D',
    price: 65000,
    currency: '₹',
    vendor_name: 'TravelTriangle',
    rating: 4.5,
    hotel_stars: 4,
    includes_flights: true,
    includes_hotels: true,
    includes_transfers: true,
    includes_meals: true,
    includes_sightseeing: true,
    image_url: 'https://images.unsplash.com/photo-1486334803289-1623f249dd1e',
    highlights: [
      'Seven Colored Earths',
      'Casela Nature Park',
      'Blue Bay Marine Park',
      'Chamarel Waterfall',
      'Boat trip to Ile aux Cerfs',
    ],
    refundable: true,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Initialize database
    await initializeDB();

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await query('DELETE FROM enquiries');
    await query('DELETE FROM packages');
    await query('DELETE FROM vendors');

    // Insert vendors
    console.log('📝 Inserting vendors...');
    for (const vendor of vendors) {
      await query(
        `INSERT INTO vendors (name, type, contact_email, contact_phone, website_url, rating)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name) DO NOTHING`,
        [
          vendor.name,
          vendor.type,
          vendor.contact_email,
          vendor.contact_phone,
          vendor.website_url,
          vendor.rating,
        ]
      );
    }

    // Insert packages
    console.log('📦 Inserting packages...');
    for (const pkg of packages) {
      // Get vendor ID
      const vendorResult = await query(
        'SELECT id FROM vendors WHERE name = $1',
        [pkg.vendor_name]
      );

      if (vendorResult.rows.length === 0) {
        console.warn(`⚠️ Vendor not found: ${pkg.vendor_name}`);
        continue;
      }

      const vendorId = vendorResult.rows[0].id;

      await query(
        `INSERT INTO packages (
          title, destination, origin, duration, price, currency, vendor_id,
          rating, hotel_stars,
          includes_flights, includes_hotels, includes_transfers,
          includes_meals, includes_sightseeing,
          image_url, images, highlights, itinerary, hotel_info, flight_info,
          refundable
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [
          pkg.title,
          pkg.destination,
          pkg.origin,
          pkg.duration,
          pkg.price,
          pkg.currency,
          vendorId,
          pkg.rating,
          pkg.hotel_stars,
          pkg.includes_flights,
          pkg.includes_hotels,
          pkg.includes_transfers,
          pkg.includes_meals,
          pkg.includes_sightseeing,
          pkg.image_url,
          pkg.images || [],
          pkg.highlights || [],
          JSON.stringify(pkg.itinerary || []),
          JSON.stringify(pkg.hotel_info || {}),
          JSON.stringify(pkg.flight_info || {}),
          pkg.refundable,
        ]
      );
    }

    console.log('✅ Database seeded successfully!');
    
    // Show summary
    const vendorCount = await query('SELECT COUNT(*) FROM vendors');
    const packageCount = await query('SELECT COUNT(*) FROM packages');
    
    console.log('\n📊 Summary:');
    console.log(`   Vendors: ${vendorCount.rows[0].count}`);
    console.log(`   Packages: ${packageCount.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();


import axios from 'axios';
import cheerio from 'cheerio';
import { query } from '../db.js';

/**
 * Generic web scraper service for fetching and parsing travel package data
 */

// Default headers to mimic a browser
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
};

/**
 * Fetch HTML content from a URL
 */
async function fetchHtml(url) {
  try {
    const response = await axios.get(url, {
      headers: DEFAULT_HEADERS,
      timeout: 30000, // 30 seconds timeout
      maxRedirects: 5,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    throw error;
  }
}

/**
 * Generic parser - can be extended for specific websites
 * This is a template that extracts common travel package information
 */
function parseTravelPackages(html, sourceUrl) {
  const $ = cheerio.load(html);
  const packages = [];

  // This is a generic parser template
  // You'll need to customize selectors based on the target website structure
  
  // Try to find package listings (common selectors)
  $('.package, .trip, .tour, [class*="package"], [class*="tour"], [class*="trip"]').each((i, elem) => {
    try {
      const $elem = $(elem);
      
      // Extract package information (adjust selectors based on website structure)
      const title = $elem.find('.title, .name, h2, h3, [class*="title"], [class*="name"]').first().text().trim();
      const priceText = $elem.find('.price, [class*="price"], [data-price]').first().text().trim();
      const description = $elem.find('.description, .desc, p').first().text().trim();
      const imageUrl = $elem.find('img').first().attr('src') || $elem.find('img').first().attr('data-src');
      const link = $elem.find('a').first().attr('href');

      // Only add if we have at least title and price
      if (title && priceText) {
        // Extract numeric price
        const priceMatch = priceText.match(/[\d,]+/);
        const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : null;

        if (price) {
          // Extract destination from title or description
          const destinationMatch = title.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/) || 
                                  description.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
          const destination = destinationMatch ? destinationMatch[1] : 'Unknown';

          // Extract duration if available
          const durationMatch = title.match(/(\d+[ND])|(\d+\s*(?:days?|nights?))/i) ||
                               description.match(/(\d+[ND])|(\d+\s*(?:days?|nights?))/i);
          const duration = durationMatch ? durationMatch[0].toUpperCase() : 'Unknown';

          packages.push({
            title: title.substring(0, 500), // Limit length
            destination,
            duration,
            price,
            currency: '₹',
            description,
            image_url: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, sourceUrl).href) : null,
            source_url: link ? (link.startsWith('http') ? link : new URL(link, sourceUrl).href) : sourceUrl,
            raw_data: {
              title,
              priceText,
              description,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error parsing package element:', error);
    }
  });

  // If no packages found with generic selectors, try extracting from JSON-LD or structured data
  if (packages.length === 0) {
    // Try to find JSON-LD structured data
    $('script[type="application/ld+json"]').each((i, elem) => {
      try {
        const jsonData = JSON.parse($(elem).html());
        if (jsonData['@type'] === 'Product' || jsonData['@type'] === 'TouristTrip') {
          packages.push({
            title: jsonData.name || 'Travel Package',
            destination: jsonData.destination || 'Unknown',
            duration: jsonData.duration || 'Unknown',
            price: jsonData.offers?.price || 0,
            currency: jsonData.offers?.priceCurrency || '₹',
            description: jsonData.description || '',
            image_url: jsonData.image || null,
            source_url: sourceUrl,
          });
        }
      } catch (error) {
        // Invalid JSON, skip
      }
    });
  }

  return packages;
}

/**
 * Save scraped packages to database
 */
async function savePackagesToDB(packages, vendorId) {
  const savedPackages = [];

  for (const pkg of packages) {
    try {
      // Check if package already exists (by title and price similarity)
      const existing = await query(
        `SELECT id FROM packages 
         WHERE title = $1 AND ABS(price - $2) < 100 AND vendor_id = $3
         LIMIT 1`,
        [pkg.title, pkg.price, vendorId]
      );

      if (existing.rows.length > 0) {
        // Update existing package
        await query(
          `UPDATE packages 
           SET price = $1, updated_at = CURRENT_TIMESTAMP, image_url = COALESCE($2, image_url)
           WHERE id = $3`,
          [pkg.price, pkg.image_url, existing.rows[0].id]
        );
        savedPackages.push({ ...pkg, id: existing.rows[0].id, action: 'updated' });
      } else {
        // Insert new package
        const result = await query(
          `INSERT INTO packages (
            title, destination, origin, duration, price, currency, vendor_id,
            image_url, highlights, includes_hotels, includes_flights
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id`,
          [
            pkg.title,
            pkg.destination,
            pkg.origin || null,
            pkg.duration || 'Unknown',
            pkg.price,
            pkg.currency || '₹',
            vendorId,
            pkg.image_url || null,
            pkg.description ? [pkg.description.substring(0, 200)] : [],
            true, // Assume includes hotels
            pkg.includes_flights || false,
          ]
        );
        savedPackages.push({ ...pkg, id: result.rows[0].id, action: 'created' });
      }
    } catch (error) {
      console.error('Error saving package:', error);
    }
  }

  return savedPackages;
}

/**
 * Main scraping function
 * @param {string} url - URL to scrape
 * @param {number} vendorId - Vendor ID to associate packages with
 * @param {Object} options - Additional options (custom parser, etc.)
 */
export async function scrapeWebsite(url, vendorId, options = {}) {
  try {
    console.log(`🔍 Scraping ${url}...`);
    
    // Fetch HTML
    const html = await fetchHtml(url);
    
    // Parse packages
    let packages;
    if (options.customParser && typeof options.customParser === 'function') {
      packages = options.customParser(html, url);
    } else {
      packages = parseTravelPackages(html, url);
    }

    if (packages.length === 0) {
      console.log('⚠️ No packages found. The website structure may be different.');
      return {
        success: false,
        message: 'No packages found. Website structure may require custom parser.',
        packages: [],
      };
    }

    console.log(`📦 Found ${packages.length} packages`);

    // Save to database
    const savedPackages = await savePackagesToDB(packages, vendorId);

    return {
      success: true,
      message: `Successfully scraped and saved ${savedPackages.length} packages`,
      packages: savedPackages,
      stats: {
        total: savedPackages.length,
        created: savedPackages.filter(p => p.action === 'created').length,
        updated: savedPackages.filter(p => p.action === 'updated').length,
      },
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      success: false,
      message: error.message || 'Failed to scrape website',
      packages: [],
    };
  }
}

/**
 * Scrape multiple URLs
 */
export async function scrapeMultipleWebsites(urls, vendorId, options = {}) {
  const results = [];
  
  for (const url of urls) {
    try {
      const result = await scrapeWebsite(url, vendorId, options);
      results.push({ url, ...result });
      
      // Add delay between requests to be respectful
      if (urls.indexOf(url) < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    } catch (error) {
      results.push({
        url,
        success: false,
        message: error.message,
        packages: [],
      });
    }
  }
  
  return results;
}


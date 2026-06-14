/**
 * Tour Fetcher Service v2
 * Searches Google CSE / SerpAPI for planned group tours,
 * then deep-parses each result page for: full plan, amenities,
 * contact info, itinerary, inclusions/exclusions, images.
 *
 * Also supports structured queries that mimic Instagram / Facebook
 * ad-style searches (tour operators posting fixed departures).
 *
 * Env vars:
 *   GOOGLE_SEARCH_API_KEY + GOOGLE_CSE_ID   (Google Custom Search)
 *   SERP_API_KEY                             (SerpAPI fallback)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { query } from '../db.js';

const GOOGLE_API = 'https://www.googleapis.com/customsearch/v1';
const SERP_API   = 'https://serpapi.com/search.json';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-IN,en;q=0.9',
};

// ─── search queries ──────────────────────────────────────────────────────────

function buildQueries(destination, origin) {
  const base = origin ? `${destination} tour from ${origin}` : `${destination} tour packages`;
  return [
    // Specifically target 14-day tours as requested
    `"14 days" OR "2 weeks" ${base} "fixed departure" 2026`,
    // Long group tours
    `"group tour" ${base} "14 days" price "whatsapp"`,
    // General discovery
    `"fixed departure" ${base} 2025 2026 price`,
  ];
}

// ─── search backends ─────────────────────────────────────────────────────────

async function searchGoogle(q) {
  try {
    const { data } = await axios.get(GOOGLE_API, {
      params: { key: process.env.GOOGLE_SEARCH_API_KEY, cx: process.env.GOOGLE_CSE_ID, q, num: 10 },
      timeout: 10000,
    });
    return (data.items || []).map(i => ({ title: i.title, url: i.link, snippet: i.snippet, source: 'google' }));
  } catch (err) {
    if (err.response?.status === 403) {
      console.warn('⚠️ Google Custom Search 403: API not enabled or quota exceeded.');
    }
    throw err;
  }
}

async function searchSerp(q) {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey || apiKey === 'your_serpapi_key_here') {
    throw new Error('SerpAPI key not configured');
  }
  
  const { data } = await axios.get(SERP_API, {
    params: { api_key: apiKey, q, hl: 'en', gl: 'in', num: 10 },
    timeout: 10000,
  });
  return (data.organic_results || []).map(i => ({ title: i.title, url: i.link, snippet: i.snippet, source: 'google' }));
}

/**
 * Sequential search with fallback
 */
async function searchInternet(q) {
  let errors = [];

  // Try Google first
  if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_CSE_ID) {
    try {
      return await searchGoogle(q);
    } catch (e) {
      errors.push(`Google: ${e.message}`);
    }
  }

  // Try SerpAPI fallback
  if (process.env.SERP_API_KEY && process.env.SERP_API_KEY !== 'your_serpapi_key_here') {
    try {
      return await searchSerp(q);
    } catch (e) {
      errors.push(`SerpAPI: ${e.message}`);
    }
  }

  // Last resort: If both configured but failed, throw a summary
  if (errors.length > 0) {
    throw new Error(`Search failed: ${errors.join(' | ')}`);
  }
  
  throw new Error('No search API configured. Set GOOGLE_SEARCH_API_KEY or SERP_API_KEY');
}

// Determine platform from URL
function detectPlatform(url) {
  if (!url) return 'google';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('facebook.com')) return 'facebook';
  if (url.includes('googleads') || url.includes('doubleclick')) return 'ads';
  return 'google';
}

// ─── regex helpers ───────────────────────────────────────────────────────────

const PRICE_RE   = /(?:₹|Rs\.?|INR)\s*([\d,]+)/i;
const DATE_RE    = /(\d{1,2}[\s/-]\w{3,9}[\s/-]\d{2,4}|\w{3,9}\s+\d{1,2},?\s*\d{4})/gi;
const NIGHTS_RE  = /(\d+)\s*(?:nights?|N)\s*[/\\]?\s*(?:(\d+)\s*(?:days?|D))?/i;
const PHONE_RE   = /(?:\+91[\s-]?)?[6-9]\d{9}/g;
const EMAIL_RE   = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const WA_RE      = /(?:wa\.me|whatsapp)[^\d]*(\+?[\d\s-]{10,15})/i;

const AMENITY_KEYWORDS = [
  'wifi', 'ac', 'air condition', 'breakfast', 'lunch', 'dinner', 'meals', 'pool',
  'swimming', 'gym', 'spa', 'parking', 'airport transfer', 'guide', 'sightseeing',
  'bonfire', 'trek', 'camp', 'rafting', 'cable car', 'ferry',
];

const INCLUSION_MARKERS = ['inclusions', 'includes', 'what\'s included', 'package includes'];
const EXCLUSION_MARKERS = ['exclusions', 'excludes', 'not included', 'package excludes'];

function parseDateLoose(s) {
  try { const d = new Date(s); return isNaN(d) ? null : d.toISOString().split('T')[0]; } catch { return null; }
}

// ─── deep page parser ────────────────────────────────────────────────────────

async function fetchAndParsePage(url) {
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000, maxRedirects: 3 });
    const $ = cheerio.load(data);
    const text = $('body').text().replace(/\s+/g, ' ');

    // Price
    const priceM = text.match(PRICE_RE);
    const price = priceM ? parseFloat(priceM[1].replace(/,/g, '')) : null;

    // Dates
    const allDates = [...text.matchAll(DATE_RE)].map(m => parseDateLoose(m[0])).filter(Boolean);
    const tour_start_date = allDates[0] || null;
    const tour_end_date   = allDates[1] || null;

    // Duration
    const nightsM = text.match(NIGHTS_RE);
    const duration = nightsM ? `${nightsM[1]}N/${nightsM[2] || parseInt(nightsM[1]) + 1}D` : null;

    // Contact
    const phones = [...text.matchAll(PHONE_RE)].map(m => m[0].replace(/\s/g, ''));
    const emails = [...text.matchAll(EMAIL_RE)];
    const waM    = text.match(WA_RE);
    const contact_phone    = phones[0] || null;
    const contact_email    = emails[0]?.[0] || null;
    const contact_whatsapp = waM ? waM[1].replace(/\s/g, '') : (phones[1] || null);

    // Image
    const image_url = $('meta[property="og:image"]').attr('content')
      || $('img[class*="hero"], img[class*="banner"], img[class*="main"]').first().attr('src')
      || $('img').first().attr('src') || null;

    // Amenities — scan for known keywords
    const lowerText = text.toLowerCase();
    const amenities = AMENITY_KEYWORDS.filter(k => lowerText.includes(k));

    // Inclusions / Exclusions — find list items near those headers
    const inclusions = [];
    const exclusions = [];
    $('h2, h3, h4, strong, b, li').each((_, el) => {
      const heading = $(el).text().toLowerCase().trim();
      const isIncl  = INCLUSION_MARKERS.some(m => heading.includes(m));
      const isExcl  = EXCLUSION_MARKERS.some(m => heading.includes(m));
      if (isIncl || isExcl) {
        // Grab sibling / following list items
        $(el).nextAll('ul, ol').first().find('li').each((_, li) => {
          const item = $(li).text().trim();
          if (item) (isIncl ? inclusions : exclusions).push(item.substring(0, 150));
        });
      }
    });

    // Full plan / itinerary
    const itinerary = [];
    $('[class*="day"], [class*="itinerary"], [id*="day"], [id*="itinerary"]').each((i, el) => {
      const dayText = $(el).text().replace(/\s+/g, ' ').trim();
      if (dayText.length > 20 && dayText.length < 2000) {
        itinerary.push({ day: i + 1, description: dayText.substring(0, 500) });
      }
    });

    // Full plan fallback — grab largest paragraph block
    let full_plan = null;
    if (itinerary.length === 0) {
      let biggest = '';
      $('p, div[class*="desc"], div[class*="detail"]').each((_, el) => {
        const t = $(el).text().replace(/\s+/g, ' ').trim();
        if (t.length > biggest.length) biggest = t;
      });
      full_plan = biggest.substring(0, 3000) || null;
    }

    // Highlights
    const highlights = [];
    $('[class*="highlight"] li, [class*="feature"] li').each((_, li) => {
      const t = $(li).text().trim();
      if (t) highlights.push(t.substring(0, 200));
    });

    return {
      price, tour_start_date, tour_end_date, duration,
      contact_phone, contact_email, contact_whatsapp,
      image_url: image_url?.startsWith('//') ? 'https:' + image_url : image_url,
      amenities,
      inclusions,
      exclusions,
      itinerary: itinerary.length ? itinerary : null,
      full_plan: itinerary.length ? null : full_plan,
      highlights,
    };
  } catch {
    return null;
  }
}

// ─── DB ──────────────────────────────────────────────────────────────────────

async function saveFetchedTour(tour) {
  const existing = await query(`SELECT id FROM fetched_tours WHERE source_url=$1 LIMIT 1`, [tour.source_url]);

  if (existing.rows.length) {
    await query(
      `UPDATE fetched_tours SET price=$1,tour_start_date=$2,tour_end_date=$3,
       contact_phone=$4,contact_email=$5,contact_whatsapp=$6,amenities=$7,
       itinerary=$8,full_plan=$9,inclusions=$10,exclusions=$11,
       highlights=$12,image_url=$13,fetched_at=NOW() WHERE id=$14`,
      [tour.price, tour.tour_start_date, tour.tour_end_date,
       tour.contact_phone, tour.contact_email, tour.contact_whatsapp,
       tour.amenities, JSON.stringify(tour.itinerary), tour.full_plan,
       tour.inclusions, tour.exclusions, tour.highlights, tour.image_url,
       existing.rows[0].id]
    );
    return { ...tour, id: existing.rows[0].id, action: 'updated' };
  }

  const r = await query(
    `INSERT INTO fetched_tours
       (title,destination,origin,tour_start_date,tour_end_date,duration,
        price,currency,vendor_name,contact_phone,contact_email,contact_whatsapp,
        source_platform,source_url,image_url,amenities,itinerary,full_plan,
        highlights,inclusions,exclusions,raw_data)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
     RETURNING id`,
    [tour.title, tour.destination, tour.origin, tour.tour_start_date, tour.tour_end_date,
     tour.duration, tour.price, tour.currency, tour.vendor_name,
     tour.contact_phone, tour.contact_email, tour.contact_whatsapp,
     tour.source_platform, tour.source_url, tour.image_url,
     tour.amenities, JSON.stringify(tour.itinerary), tour.full_plan,
     tour.highlights, tour.inclusions, tour.exclusions,
     JSON.stringify(tour.raw_data)]
  );
  return { ...tour, id: r.rows[0].id, action: 'created' };
}

// ─── public ──────────────────────────────────────────────────────────────────

/**
 * Fetch planned tours from internet for a destination.
 * @param {string} destination
 * @param {string} [origin]
 * @param {boolean} [deep=true]  - whether to fetch each result page for full data
 */
export async function fetchPlannedTours(destination, origin = null, deep = true) {
  const queries = buildQueries(destination, origin);
  const seen    = new Set();
  const allResults = [];

  for (const q of queries) {
    try {
      const results = await searchInternet(q);
      for (const r of results) {
        if (!seen.has(r.url)) { seen.add(r.url); allResults.push(r); }
      }
    } catch (err) {
      console.warn(`Search query failed: ${err.message}`);
    }
    // small delay between queries
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`📋 ${allResults.length} unique results for "${destination}"`);

  const tours = [];

  for (const result of allResults) {
    // Quick extract from snippet
    const snippetText = `${result.title} ${result.snippet || ''}`;
    const priceM  = snippetText.match(PRICE_RE);
    const nightsM = snippetText.match(NIGHTS_RE);

    let tour = {
      title:           result.title,
      destination,
      origin:          origin || null,
      price:           priceM ? parseFloat(priceM[1].replace(/,/g, '')) : null,
      currency:        '₹',
      duration:        nightsM ? `${nightsM[1]}N/${nightsM[2] || parseInt(nightsM[1]) + 1}D` : null,
      vendor_name:     (() => { try { return new URL(result.url).hostname.replace('www.','').split('.')[0]; } catch { return 'Unknown'; } })(),
      source_platform: detectPlatform(result.url),
      source_url:      result.url,
      tour_start_date: null,
      tour_end_date:   null,
      contact_phone: null, contact_email: null, contact_whatsapp: null,
      image_url: null, amenities: [], itinerary: null, full_plan: null,
      highlights: [], inclusions: [], exclusions: [],
      raw_data: { snippet: result.snippet, search_source: result.source },
    };

    // Deep fetch from page
    if (deep) {
      const details = await fetchAndParsePage(result.url);
      if (details) {
        Object.keys(details).forEach(k => {
          if (details[k] !== null && details[k] !== undefined) tour[k] = details[k];
        });
      }
      await new Promise(r => setTimeout(r, 800));
    }

    try {
      const saved = await saveFetchedTour(tour);
      tours.push(saved);
    } catch (err) {
      console.error('Save failed:', err.message);
    }
  }

  return { total: tours.length, destination, tours };
}

/**
 * Fetch a global mix of tours from popular Indian destinations.
 */
export async function fetchGlobalTours(limit = 10) {
  const popularDestinations = ['Himachal', 'Goa', 'Uttarakhand', 'Kerala', 'Ladakh', 'Rajasthan'];
  // Pick a random one for variety or search for all
  const dest = popularDestinations[Math.floor(Math.random() * popularDestinations.length)];
  console.log(`🌍 Triggering global discovery scan for ${dest}...`);
  return await fetchPlannedTours(dest, null, true);
}
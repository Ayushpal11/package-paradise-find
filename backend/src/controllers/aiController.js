import { query } from '../db.js';
import * as mistralService from '../services/mistralService.js';
import { fetchPlannedTours } from '../services/tourFetcherService.js';
import { asyncHandler, BadRequest } from '../utils/asyncHandler.js';
import { validateRequired, sanitizeString, parseNumber } from '../utils/validation.js';

/**
 * AI Controller for trip planning and analysis
 */

export const getAITripPlan = asyncHandler(async (req, res) => {
  const { destination, days, startDate, preferences, budget, travellers, origin } = req.body;

  validateRequired(req.body, ['destination']);

  const sanitizedDestination = sanitizeString(destination, 255);
  const sanitizedDays = parseNumber(days, 7);
  const sanitizedBudget = budget ? parseNumber(budget) : null;
  const sanitizedTravellers = parseNumber(travellers, 2);
  const sanitizedOrigin = origin ? sanitizeString(origin, 255) : null;
  const sanitizedStartDate = startDate ? sanitizeString(startDate, 50) : null;
  const sanitizedPreferences = preferences ? sanitizeString(preferences, 1000) : null;

  // 1. Fetch relevant tour data from database or fetch new if needed
  let scrapedDataResult = await query(
    `SELECT * FROM fetched_tours
     WHERE destination ILIKE $1
     AND (tour_start_date IS NULL OR tour_start_date >= CURRENT_DATE)
     ORDER BY fetched_at DESC
     LIMIT 20`,
    [`%${sanitizedDestination}%`]
  );

  let scrapedData = scrapedDataResult.rows;

  // 2. If no data, try to fetch some fresh data
  if (scrapedData.length === 0) {
    console.log(`No data found for ${sanitizedDestination}, fetching fresh data...`);
    const fetchResult = await fetchPlannedTours(sanitizedDestination, sanitizedOrigin);
    scrapedData = fetchResult.tours;
  }

  // 3. Use Mistral to generate schedule and analysis
  const userInput = {
    destination: sanitizedDestination,
    days: sanitizedDays,
    startDate: sanitizedStartDate,
    preferences: sanitizedPreferences,
    budget: sanitizedBudget,
    travellers: sanitizedTravellers,
  };

  // We can run these in parallel
  const [schedule, analysis, recommendations] = await Promise.all([
    mistralService.generateTripSchedule(userInput, scrapedData),
    mistralService.performCostAnalysis(userInput, scrapedData),
    mistralService.recommendTrip(userInput, scrapedData)
  ]);

  res.json({
    success: true,
    data: {
      destination: sanitizedDestination,
      schedule,
      analysis,
      recommendations,
      references: scrapedData.map(t => ({
        title: t.title,
        price: t.price,
        vendor: t.vendor_name,
        url: t.source_url,
        platform: t.source_platform
      }))
    }
  });
});

/**
 * Specifically get cost analysis
 */
export const getAICostAnalysis = asyncHandler(async (req, res) => {
  const { destination, budget, travellers } = req.body;

  validateRequired(req.body, ['destination']);

  const sanitizedDestination = sanitizeString(destination, 255);
  const sanitizedBudget = budget ? parseNumber(budget) : null;
  const sanitizedTravellers = parseNumber(travellers, 2);

  const scrapedDataResult = await query(
    `SELECT * FROM fetched_tours WHERE destination ILIKE $1 LIMIT 15`,
    [`%${sanitizedDestination}%`]
  );

  const analysis = await mistralService.performCostAnalysis(
    { destination: sanitizedDestination, budget: sanitizedBudget, travellers: sanitizedTravellers },
    scrapedDataResult.rows
  );

  res.json({ success: true, analysis });
});
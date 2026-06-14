import { query } from '../db.js';
import * as mistralService from '../services/mistralService.js';
import { fetchPlannedTours } from '../services/tourFetcherService.js';

/**
 * AI Controller for trip planning and analysis
 */

export const getAITripPlan = async (req, res) => {
  try {
    const { destination, days, startDate, preferences, budget, travellers, origin } = req.body;

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    // 1. Fetch relevant tour data from database or fetch new if needed
    let scrapedDataResult = await query(
      `SELECT * FROM fetched_tours 
       WHERE destination ILIKE $1 
       AND (tour_start_date IS NULL OR tour_start_date >= CURRENT_DATE)
       ORDER BY fetched_at DESC 
       LIMIT 20`,
      [`%${destination}%`]
    );

    let scrapedData = scrapedDataResult.rows;

    // 2. If no data, try to fetch some fresh data
    if (scrapedData.length === 0) {
      console.log(`No data found for ${destination}, fetching fresh data...`);
      const fetchResult = await fetchPlannedTours(destination, origin);
      scrapedData = fetchResult.tours;
    }

    // 3. Use Mistral to generate schedule and analysis
    const userInput = { destination, days, startDate, preferences, budget, travellers };
    
    // We can run these in parallel
    const [schedule, analysis, recommendations] = await Promise.all([
      mistralService.generateTripSchedule(userInput, scrapedData),
      mistralService.performCostAnalysis(userInput, scrapedData),
      mistralService.recommendTrip(userInput, scrapedData)
    ]);

    res.json({
      success: true,
      data: {
        destination,
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

  } catch (error) {
    console.error('Error in getAITripPlan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI trip plan',
      message: error.message
    });
  }
};

/**
 * Specifically get cost analysis
 */
export const getAICostAnalysis = async (req, res) => {
  try {
    const { destination, budget, travellers } = req.body;
    
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    const scrapedDataResult = await query(
      `SELECT * FROM fetched_tours WHERE destination ILIKE $1 LIMIT 15`,
      [`%${destination}%`]
    );

    const analysis = await mistralService.performCostAnalysis(
      { destination, budget, travellers },
      scrapedDataResult.rows
    );

    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
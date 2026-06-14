import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

/**
 * Mistral AI Service for travel planning and cost analysis
 */

async function callMistral(messages, model = 'mistral-medium') {
  if (!MISTRAL_API_KEY) {
    console.warn('MISTRAL_API_KEY is not set. AI features will be limited.');
    throw new Error('Mistral AI Key is missing');
  }

  try {
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Mistral AI API Error:', error.response?.data || error.message);
    throw new Error('Failed to communicate with Mistral AI');
  }
}

/**
 * Generate a detailed trip schedule based on user inputs and scraped data
 */
export async function generateTripSchedule(userInput, scrapedData) {
  const { destination, days, startDate, preferences } = userInput;
  
  const systemPrompt = `You are an expert travel planner. Create a detailed daily trip schedule for ${days} days in ${destination}. 
  Reference the provided scraped tour data to make realistic recommendations. 
  Include activities, estimated times, and location names.`;

  const userPrompt = `
    Destination: ${destination}
    Duration: ${days} days
    Start Date: ${startDate || 'Flexible'}
    Preferences: ${preferences || 'General sightseeing'}

    Scraped Tour Data for Reference:
    ${JSON.stringify(scrapedData.slice(0, 5), null, 2)}

    Format the output as a structured daily itinerary using Markdown. Use bolding for times and locations. Use bullet points for activities. Mention specific tour operators from the data if they offer matching activities.
  `;

  return await callMistral([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);
}

/**
 * Perform a cost analysis of the trip
 */
export async function performCostAnalysis(userInput, scrapedData) {
  const { destination, budget, travellers } = userInput;

  const systemPrompt = `You are a travel budget analyst. Analyze the costs for a trip to ${destination}. 
  Compare the provided scraped package prices and estimate additional costs (flights, meals, local transport, activities).`;

  const userPrompt = `
    Destination: ${destination}
    Budget: ${budget || 'Not specified'}
    Number of Travellers: ${travellers || 1}

    Scraped Tour Data for Reference:
    ${JSON.stringify(scrapedData.slice(0, 10), null, 2)}

    Provide a detailed cost breakdown using Markdown tables. Include:
    1. A table comparing average package costs.
    2. A table for estimated daily expenses (meals, transport).
    3. A final total estimated cost per person.
    4. A value-for-money analysis of the scraped packages.
  `;

  return await callMistral([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);
}

/**
 * Recommend a trip based on user inputs
 */
export async function recommendTrip(userInput, scrapedData) {
  const { destination, preferences, budget } = userInput;

  const systemPrompt = `You are a travel consultant. Recommend the best tour packages from the provided list based on user preferences. 
  Explain WHY you recommended each one.`;

  const userPrompt = `
    Destination: ${destination}
    Preferences: ${preferences || 'Balanced trip'}
    Budget: ${budget || 'Any'}

    Packages Available:
    ${JSON.stringify(scrapedData, null, 2)}

    Pick the top 3 recommendations. For each, include:
    - Title
    - Why it fits the user's needs
    - Price and what's included
    - Contact info (if available in the data)
  `;

  return await callMistral([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);
}
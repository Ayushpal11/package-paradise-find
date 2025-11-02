/**
 * Configuration file for websites to scrape
 * Add the URLs of travel websites from which you want to compare prices
 * 
 * Usage:
 * 1. Add website URLs to the websites array below
 * 2. Optionally add vendor information for each website
 * 3. Run the scraper using the API or scheduled job
 */

export const scraperConfig = {
  // List of websites to scrape
  websites: [
    // Example: Add your travel website URLs here
    // {
    //   url: 'https://example-travel-site.com/packages',
    //   vendorName: 'Example Travel',
    //   vendorType: 'OTA', // or 'Local'
    //   enabled: true,
    //   // Optional: Add custom parser function reference if needed
    //   // customParser: customParseExampleTravel,
    // },
    
    // Add more websites here:
    // {
    //   url: 'https://makemytrip.com/holidays',
    //   vendorName: 'MakeMyTrip',
    //   vendorType: 'OTA',
    //   enabled: true,
    // },
    // {
    //   url: 'https://goibibo.com/packages',
    //   vendorName: 'Goibibo',
    //   vendorType: 'OTA',
    //   enabled: true,
    // },
  ],

  // Scraping settings
  settings: {
    // Delay between requests (milliseconds)
    delayBetweenRequests: 2000, // 2 seconds
    
    // Timeout for each request (milliseconds)
    requestTimeout: 30000, // 30 seconds
    
    // Maximum retries on failure
    maxRetries: 3,
    
    // Auto-scrape interval (if using scheduled scraping)
    // Set to null to disable auto-scraping
    autoScrapeInterval: null, // e.g., '1h', '6h', '24h' or null
    
    // User agent for requests
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
};

/**
 * Helper function to get enabled websites only
 */
export function getEnabledWebsites() {
  return scraperConfig.websites.filter(site => site.enabled !== false);
}

/**
 * Example of how to add a website programmatically
 */
export function addWebsite(url, vendorName, vendorType = 'OTA') {
  scraperConfig.websites.push({
    url,
    vendorName,
    vendorType,
    enabled: true,
  });
}


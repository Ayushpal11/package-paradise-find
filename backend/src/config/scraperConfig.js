/**
 * Scraper / Tour-Fetcher Configuration
 * Real Indian OTA and tour-operator URLs for planned group tours.
 */

export const scraperConfig = {
  websites: [
    {
      url: 'https://www.traveltriangle.com/tour-packages',
      vendorName: 'TravelTriangle',
      vendorType: 'OTA',
      enabled: true,
    },
    {
      url: 'https://www.thrillophilia.com/tours',
      vendorName: 'Thrillophilia',
      vendorType: 'OTA',
      enabled: true,
    },
    {
      url: 'https://www.kesari.in/tour-packages',
      vendorName: 'Kesari Tours',
      vendorType: 'OTA',
      enabled: true,
    },
    {
      url: 'https://www.veenaworld.com/tour-packages',
      vendorName: 'Veena World',
      vendorType: 'OTA',
      enabled: true,
    },
    {
      url: 'https://www.thomascook.in/holidays/india',
      vendorName: 'Thomas Cook India',
      vendorType: 'OTA',
      enabled: true,
    },
    {
      url: 'https://www.sotc.in/tour-packages',
      vendorName: 'SOTC',
      vendorType: 'OTA',
      enabled: true,
    },
    {
      url: 'https://www.coxandkings.com/holidays',
      vendorName: 'Cox & Kings',
      vendorType: 'OTA',
      enabled: false, // enable when needed
    },
    // MakeMyTrip / Yatra block JS-heavy rendering – scraping via Cheerio won't work well.
    // Use the tourFetcherService (Google Search) to discover their packages instead.
  ],

  settings: {
    delayBetweenRequests: 3000,
    requestTimeout:       30000,
    maxRetries:           2,
    autoScrapeInterval:   null, // e.g. '6h' — set to enable scheduled scraping
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
};

export function getEnabledWebsites() {
  return scraperConfig.websites.filter(site => site.enabled !== false);
}

export function addWebsite(url, vendorName, vendorType = 'OTA') {
  scraperConfig.websites.push({ url, vendorName, vendorType, enabled: true });
}

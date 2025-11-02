/**
 * Scheduled scraper utility
 * Automatically scrapes configured websites at regular intervals
 * 
 * Usage:
 * 1. Configure websites in scraperConfig.js
 * 2. Import and call startScheduledScraping() in your app.js
 */

import { scrapeMultipleWebsites } from '../services/scraperService.js';
import { query } from '../db.js';
import { scraperConfig, getEnabledWebsites } from '../config/scraperConfig.js';

let scrapingInterval = null;

/**
 * Scrape all enabled websites from config
 */
export async function scrapeAllWebsites() {
  const enabledWebsites = getEnabledWebsites();
  
  if (enabledWebsites.length === 0) {
    console.log('⚠️ No enabled websites found in scraperConfig.js');
    return;
  }

  console.log(`🚀 Starting scheduled scrape of ${enabledWebsites.length} websites...`);

  for (const site of enabledWebsites) {
    try {
      // Get or create vendor
      let vendorResult = await query(
        'SELECT id FROM vendors WHERE name = $1',
        [site.vendorName]
      );

      if (vendorResult.rows.length === 0) {
        vendorResult = await query(
          `INSERT INTO vendors (name, type, website_url) 
           VALUES ($1, $2, $3) 
           RETURNING id`,
          [site.vendorName, site.vendorType || 'OTA', site.url]
        );
      }

      const vendorId = vendorResult.rows[0].id;

      // Scrape the website
      const { scrapeWebsite } = await import('../services/scraperService.js');
      const result = await scrapeWebsite(
        site.url,
        vendorId,
        site.customParser ? { customParser: site.customParser } : {}
      );

      if (result.success) {
        console.log(`✅ Successfully scraped ${site.vendorName}: ${result.stats.total} packages (${result.stats.created} new, ${result.stats.updated} updated)`);
      } else {
        console.log(`❌ Failed to scrape ${site.vendorName}: ${result.message}`);
      }

      // Delay between websites
      if (enabledWebsites.indexOf(site) < enabledWebsites.length - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, scraperConfig.settings.delayBetweenRequests)
        );
      }
    } catch (error) {
      console.error(`❌ Error scraping ${site.vendorName}:`, error.message);
    }
  }

  console.log('✅ Scheduled scraping completed');
}

/**
 * Start scheduled scraping
 * @param {string} interval - Interval string like '1h', '6h', '24h', or milliseconds
 */
export function startScheduledScraping(interval = null) {
  const scrapeInterval = interval || scraperConfig.settings.autoScrapeInterval;
  
  if (!scrapeInterval) {
    console.log('ℹ️ Auto-scraping is disabled. Set autoScrapeInterval in scraperConfig.js to enable.');
    return;
  }

  // Parse interval
  let intervalMs;
  if (typeof scrapeInterval === 'string') {
    // Parse string like '1h', '6h', '24h'
    const match = scrapeInterval.match(/^(\d+)([hm])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      intervalMs = unit === 'h' ? value * 60 * 60 * 1000 : value * 60 * 1000;
    } else {
      console.error('Invalid interval format. Use format like "1h" or "30m"');
      return;
    }
  } else {
    intervalMs = scrapeInterval;
  }

  // Run immediately on start
  scrapeAllWebsites();

  // Then run at intervals
  scrapingInterval = setInterval(() => {
    scrapeAllWebsites();
  }, intervalMs);

  console.log(`⏰ Scheduled scraping started. Will run every ${scrapeInterval}`);
}

/**
 * Stop scheduled scraping
 */
export function stopScheduledScraping() {
  if (scrapingInterval) {
    clearInterval(scrapingInterval);
    scrapingInterval = null;
    console.log('⏹️ Scheduled scraping stopped');
  }
}

/**
 * Get scraping status
 */
export function getScrapingStatus() {
  return {
    isRunning: scrapingInterval !== null,
    enabledWebsitesCount: getEnabledWebsites().length,
  };
}


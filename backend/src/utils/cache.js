/**
 * Simple In-Memory Cache with TTL
 * Used for caching expensive query results (price drops, search results).
 */

class MemoryCache {
  constructor(defaultTTL = 60000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Get or compute (cache-aside pattern)
  async getOrSet(key, computeFn, ttl = this.defaultTTL) {
    const cached = this.get(key);
    if (cached !== null) return cached;

    const value = await computeFn();
    this.set(key, value, ttl);
    return value;
  }

  // Cleanup expired entries (call periodically)
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cleanup every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000);

// Cache key helpers
export const cacheKeys = {
  priceDrops: (threshold) => `price_drops_${threshold}`,
  packageSearch: (params) => `pkg_search_${JSON.stringify(params)}`,
  recentTours: (destination, limit) => `recent_tours_${destination}_${limit}`,
};

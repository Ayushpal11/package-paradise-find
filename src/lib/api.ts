import axios from 'axios';

// API base URL - defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Types for API responses
export interface Package {
  id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  currency: string;
  vendor: string;
  vendorLogo?: string;
  rating: number;
  hotelStars: number;
  inclusions: {
    flights: boolean;
    hotels: boolean;
    transfers: boolean;
    meals: boolean;
    sightseeing: boolean;
  };
  image: string;
  images?: string[];
  refundable: boolean;
  isOTA: boolean;
  highlights?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
  }>;
  hotelInfo?: {
    name: string;
    rating: number;
    amenities: string[];
  };
  flightInfo?: {
    airline: string;
    from: string;
    to: string;
    class: string;
  };
}

export interface PackageSearchParams {
  origin?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  travellers?: number;
  sortBy?: string;
  priceMin?: number;
  priceMax?: number;
  hotelStars?: number[];
  meals?: boolean;
  transfers?: boolean;
  refundable?: boolean;
  nights?: number[];
}

export interface EnquirySubmit {
  packageId: string;
  name: string;
  email: string;
  phone: string;
  travellers: number;
  message?: string;
}

export interface ScrapeRequest {
  url: string;
  vendorId?: number;
  vendorName?: string;
}

export interface ScrapeResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    vendorId: number;
    stats: {
      total: number;
      created: number;
      updated: number;
    };
    packages: any[];
  };
}

export interface Vendor {
  id: number;
  name: string;
  type: string;
  website_url: string;
  rating: number;
}

// API functions
export const packageApi = {
  // Search for packages
  search: async (params: PackageSearchParams): Promise<Package[]> => {
    const response = await api.get('/api/packages', { params });
    return response.data;
  },

  // Get single package details
  getById: async (id: string): Promise<Package> => {
    const response = await api.get(`/api/packages/${id}`);
    return response.data;
  },

  // Submit enquiry
  submitEnquiry: async (enquiry: EnquirySubmit): Promise<void> => {
    await api.post('/api/enquiries', enquiry);
  },
};

// Scraper API functions
export const scraperApi = {
  // Scrape a single URL
  scrape: async (request: ScrapeRequest): Promise<ScrapeResponse> => {
    const response = await api.post('/api/scraper/scrape', request);
    return response.data;
  },

  // Scrape multiple URLs
  scrapeMultiple: async (request: {
    urls: string[];
    vendorId?: number;
    vendorName?: string;
  }): Promise<ScrapeResponse> => {
    const response = await api.post('/api/scraper/scrape-multiple', request);
    return response.data;
  },

  // Get all vendors
  getVendors: async (): Promise<Vendor[]> => {
    const response = await api.get('/api/scraper/vendors');
    return response.data.vendors;
  },

  // Get scraping status
  getStatus: async (): Promise<any> => {
    const response = await api.get('/api/scraper/status');
    return response.data.status;
  },
};


/**
 * Input Validation utilities
 * Simple schema-less validation helpers for API endpoints.
 */

export const validateRequired = (obj, fields) => {
  const missing = [];
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  return true;
};

export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,15}$/;
  return re.test(phone);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeString = (str, maxLength = 255) => {
  if (typeof str !== 'string') return str;
  return str.trim().slice(0, maxLength);
};

export const parseNumber = (value, defaultVal = null) => {
  const num = parseFloat(value);
  return isNaN(num) ? defaultVal : num;
};

export const parseArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(s => s.trim());
  return [];
};

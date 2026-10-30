// Centralized base URL configuration for Spring Boot backend APIs
// When running in production / Docker (same origin), uses relative '/api'
// When running in local Angular development server (port 4200), points to 'http://localhost:8080/api'
const isLocalDevServer = typeof window !== 'undefined' && window.location.port === '4200';

export const API_BASE_URL = isLocalDevServer ? 'http://localhost:8080/api' : '/api';

export const API_ENDPOINTS = {
  users: `${API_BASE_URL}/users`,
  products: `${API_BASE_URL}/products`,
  cart: `${API_BASE_URL}/cart`,
  addresses: `${API_BASE_URL}/addresses`,
  orders: `${API_BASE_URL}/orders`
};

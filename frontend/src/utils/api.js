// API Base URL - reads from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://shopeasy-backend-sagk.onrender.com';

// Helper function to build API URLs
export const getApiUrl = (path) => `${API_BASE_URL}${path}`;


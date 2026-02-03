// API Configuration
// In Vite, environment variables must be prefixed with VITE_
// They are exposed to your source code via import.meta.env

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export { API_URL };

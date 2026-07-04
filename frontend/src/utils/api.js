import axios from 'axios';

// Base URL for backend API requests, configurable through Vite env variables.
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Axios instance used by the frontend to talk to the backend.
const api = axios.create({
  baseURL: API_URL,
});

// Add the auth token to each request if the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const getGreeting = (name) => {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  return `${greeting}, ${name?.split(' ')[0] || 'there'}`;
};

// Human-readable labels for roles used in the app.
export const ROLE_LABELS = {
  software_developer: 'Software Developer',
  data_scientist: 'Data Scientist',
  cyber_security: 'Cyber Security',
  cloud_engineer: 'Cloud Engineer',
  devops_engineer: 'DevOps Engineer',
  ml_engineer: 'ML Engineer',
  product_manager: 'Product Manager',
};

// Convert a role ID from the backend into a friendly label.
export const formatRole = (role) => ROLE_LABELS[role] || role;

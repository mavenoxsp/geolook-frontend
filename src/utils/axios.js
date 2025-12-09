// src/utils/axios.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.geolook.in';
const withCredentials =
  (import.meta.env.VITE_API_WITH_CREDENTIALS ?? 'false').toLowerCase() ===
  'true';

const instance = axios.create({
  baseURL,
  withCredentials,
});

export default instance;

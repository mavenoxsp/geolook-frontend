// src/utils/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:7000', // ✅ Point to your backend
  withCredentials: true,                // If using cookies or auth
});

export default instance;
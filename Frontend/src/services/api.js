import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { getValidToken } from "../utils/authSession";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Automatically attach JWT token
api.interceptors.request.use((config) => {
  const token = getValidToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

const DEFAULT_BACKEND_URL = "http://localhost:8080";

const fallbackBaseUrl =
  process.env.NODE_ENV === "development"
    ? DEFAULT_BACKEND_URL
    : typeof window !== "undefined"
      ? window.location.origin
      : DEFAULT_BACKEND_URL;

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.trim() || fallbackBaseUrl;

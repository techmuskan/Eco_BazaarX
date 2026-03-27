import { API_BASE_URL } from "../config/api";
import { buildAuthHeaders, getValidToken, parseTokenPayload } from "../utils/authSession";

const API_URL = `${API_BASE_URL}/api/auth`;

// ================= SAFE JSON PARSER =================
const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

// ================= GENERIC ERROR PARSER =================
const parseErrorResponse = async (response, fallbackMessage) => {
  const errorData = await safeJson(response);
  return errorData?.error || errorData?.message || fallbackMessage;
};

// ================= GENERIC FETCH WRAPPER =================
const fetchWithErrorHandling = async (url, options, fallbackMessage) => {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(
      `Cannot reach backend API at ${API_BASE_URL}. Ensure backend is running and CORS is enabled.`
    );
  }

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response, fallbackMessage));
  }

  return safeJson(response);
};

// ================= SIGNUP =================
export const signup = async (userData) => {
  const data = await fetchWithErrorHandling(
    `${API_URL}/signup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    },
    "Signup failed"
  );

  if (!data?.token || !data?.user) {
    throw new Error("Signup failed: invalid server response");
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

// ================= LOGIN =================
export const login = async ({ email, password }) => {
  const data = await fetchWithErrorHandling(
    `${API_URL}/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    "Invalid email or password"
  );

  if (!data?.token || !data?.user) {
    throw new Error("Login failed: invalid server response");
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (email) => {
  const data = await fetchWithErrorHandling(
    `${API_URL}/forgot?email=${encodeURIComponent(email)}`,
    { method: "POST" },
    "Failed to send OTP"
  );
  return data;
};

// ================= RESET PASSWORD =================
export const resetPassword = async ({ email, otp, newPassword }) => {
  const params = new URLSearchParams({ email, otp, newPassword });
  const data = await fetchWithErrorHandling(
    `${API_URL}/reset?${params.toString()}`,
    { method: "POST" },
    "Failed to reset password"
  );
  return data;
};

// ================= LOGOUT =================
export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

export const setStoredUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// ================= GET STORED USER =================
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// ================= GET TOKEN =================
export const getToken = () => {
  return getValidToken();
};

// ================= AUTH HEADER (IMPORTANT FOR CART / ORDER APIs) =================
export const getAuthHeader = () => {
  return buildAuthHeaders();
};

// ================= GET USER ROLE =================
export const getResolvedRole = () => {
  const storedUser = getStoredUser();
  if (storedUser?.role) return String(storedUser.role).toUpperCase();

  const token = getToken();
  if (!token) return null;

  const payload = parseTokenPayload(token);
  return payload?.role ? String(payload.role).toUpperCase() : null;
};

// ================= AUTH CHECK =================
export const isAuthenticated = () => {
  const token = getValidToken();
  if (!token) {
    logout();
    return false;
  }

  return true;
};

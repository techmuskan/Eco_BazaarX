import api from "./api";

function handleSellerError(error, fallbackMessage) {
  if (error.response) {
    throw new Error(error.response.data?.message || error.response.data?.error || fallbackMessage);
  }

  throw new Error("Unable to reach seller workspace right now.");
}

export async function fetchSellerDashboard() {
  try {
    const res = await api.get("/seller/dashboard");
    return res.data;
  } catch (error) {
    handleSellerError(error, "Failed to load seller dashboard");
  }
}

export async function fetchSellerProducts() {
  try {
    const res = await api.get("/seller/products");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    handleSellerError(error, "Failed to load seller products");
  }
}

export async function fetchSellerOrders() {
  try {
    const res = await api.get("/seller/orders");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    handleSellerError(error, "Failed to load seller orders");
  }
}

export async function fetchSellerProfile() {
  try {
    const res = await api.get("/seller/profile");
    return res.data;
  } catch (error) {
    handleSellerError(error, "Failed to load seller profile");
  }
}

export async function updateSellerProfile(profileData) {
  try {
    const res = await api.put("/seller/profile", profileData);
    return res.data;
  } catch (error) {
    handleSellerError(error, "Failed to update seller profile");
  }
}

export async function updateSellerOrderStatus(orderId, fulfillmentStatus) {
  try {
    const res = await api.put(`/seller/orders/${orderId}/status`, { fulfillmentStatus });
    return res.data;
  } catch (error) {
    handleSellerError(error, "Failed to update seller order status");
  }
}

import api from "./api";

function handleAdminError(error, fallbackMessage) {
  if (error.response) {
    throw new Error(
      error.response.data?.message ||
      error.response.data?.error ||
      fallbackMessage
    );
  }

  throw new Error("Unable to reach the admin service right now.");
}

// --- USERS ---
export async function fetchAdminUsers() {
  try {
    const res = await api.get("/admin/users");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    handleAdminError(error, "Failed to load admin users.");
  }
}

export async function deleteAdminUser(id) {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
}

export async function changeUserRole(id, role) {
  try {
    const res = await api.put(`/admin/users/${id}/role`, null, { params: { role } });
    return res.data;
  } catch (error) {
    handleAdminError(error, "Failed to update the selected user role.");
  }
}

export async function fetchSellerProfiles() {
  try {
    const res = await api.get("/admin/seller-profiles");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    handleAdminError(error, "Failed to load seller profiles.");
  }
}

export async function updateSellerApproval(id, approved) {
  try {
    const res = await api.put(`/admin/seller-profiles/${id}/approval`, null, { params: { approved } });
    return res.data;
  } catch (error) {
    handleAdminError(error, "Failed to update seller approval.");
  }
}

// --- STATS ---
export async function fetchAdminStats() {
  try {
    const res = await api.get("/admin/stats");
    return res.data;
  } catch (error) {
    handleAdminError(error, "Failed to load admin analytics.");
  }
}

// --- RECENT ORDERS ---
export async function fetchRecentOrders() {
  try {
    const stats = await fetchAdminStats();
    return stats?.recentOrders || [];
  } catch (error) {
    handleAdminError(error, "Failed to load recent orders.");
  }
}

// --- PRODUCTS ---
export const updateProductStatusAPI = async (id, statusData) => {
  try {
    const res = await api.put(`/admin/products/${id}/status`, statusData);
    return res.data;
  } catch (error) {
    handleAdminError(error, "Failed to update product moderation data.");
  }
};

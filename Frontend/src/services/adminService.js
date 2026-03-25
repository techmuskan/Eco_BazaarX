import api from "./api";

// --- USERS ---
export async function fetchAdminUsers() {
  const res = await api.get("/admin/users");
  return Array.isArray(res.data) ? res.data : [];
}

export async function deleteAdminUser(id) {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
}

export async function changeUserRole(id, role) {
  const res = await api.put(`/admin/users/${id}/role`, null, { params: { role } });
  return res.data;
}

// --- STATS ---
export async function fetchAdminStats() {
  const res = await api.get("/admin/stats");
  return res.data;
}

// --- RECENT ORDERS ---
export async function fetchRecentOrders() {
  const stats = await fetchAdminStats(); // fetch from /stats
  return stats.recentOrders || [];
}

// --- PRODUCTS ---
export const updateProductStatusAPI = async (id, statusData) => {
  const res = await api.put(`/admin/products/${id}/status`, statusData);
  return res.data;
};
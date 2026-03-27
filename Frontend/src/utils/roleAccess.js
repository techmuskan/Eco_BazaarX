export const normalizeRole = (role) => String(role || "USER").toUpperCase();

export const getRoleRootPath = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "ADMIN") {
    return "/admin";
  }

  if (normalizedRole === "SELLER") {
    return "/seller";
  }

  return "/user";
};

export const getDashboardPathForRole = (role) => {
  if (normalizeRole(role) === "ADMIN") {
    return "/admin/dashboard";
  }

  return `${getRoleRootPath(role)}/dashboard`;
};

export const getCatalogPathForRole = (role) => `${getRoleRootPath(role)}/catalog`;

export const getCartPathForRole = () => "/user/cart";

export const getCheckoutPathForRole = () => "/user/checkout";

export const getPaymentPathForRole = () => "/user/payment";

export const getOrderSuccessPathForRole = () => "/user/order-success";

export const getOrdersPathForRole = () => "/user/orders";

export const getWishlistPathForRole = () => "/user/wishlist";

export const getInsightsPathForRole = () => "/user/insights";

export const getAddProductPathForRole = (role) => {
  if (normalizeRole(role) === "ADMIN") {
    return "/admin/products/new";
  }

  return "/seller/products/new";
};

export const getSellerProductsPath = () => "/seller/products";

export const getSellerOrdersPath = () => "/seller/orders";

export const getSellerProfilePath = () => "/seller/profile";

export const getEditProductPathForRole = (role, productId) => {
  const safeId = productId ?? ":id";

  if (normalizeRole(role) === "ADMIN") {
    return `/admin/products/${safeId}/edit`;
  }

  return `/seller/products/${safeId}/edit`;
};

export const getAdminManagementPath = () => "/admin/management";

export const getAdminDashboardPath = () => "/admin/dashboard";

export const getAdminCatalogPath = () => "/admin/catalog";

export const getProductDetailPath = (productId) => `/catalog/${productId}`;

export const hasAnyRole = (role, roles = []) => {
  const normalizedRole = normalizeRole(role);
  return roles.map(normalizeRole).includes(normalizedRole);
};

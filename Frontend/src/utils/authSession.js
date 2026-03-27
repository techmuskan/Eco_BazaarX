export const parseTokenPayload = (token) => {
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = parseTokenPayload(token);
  if (!payload?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
};

export const getValidToken = () => {
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    return null;
  }

  return token;
};

export const buildAuthHeaders = (extraHeaders = {}) => {
  const token = getValidToken();
  return token
    ? { ...extraHeaders, Authorization: `Bearer ${token}` }
    : { ...extraHeaders };
};

import api from "./api";

const parseInsightsError = (error, fallbackMessage) => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;

    if (status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (status === 403) {
      throw new Error("Your account does not have access to this sustainability view.");
    }

    throw new Error(message || fallbackMessage);
  }

  throw new Error("Unable to reach the sustainability service right now.");
};

export const fetchUserInsights = async () => {
  try {
    const response = await api.get("/insights/user");
    return response.data;
  } catch (error) {
    parseInsightsError(error, "Failed to load sustainability insights.");
  }
};

export const fetchAdminAnalytics = async () => {
  try {
    const response = await api.get("/insights/admin/report");
    return response.data;
  } catch (error) {
    parseInsightsError(error, "Failed to load admin sustainability analytics.");
  }
};

// recommendationService.js
export const getRecommendations = async (productId) => {
  try {
    const token = localStorage.getItem("token");

    // ✅ Optional: check token
    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      "http://localhost:8080/api/recommendations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productId,
        }),
      }
    );

    // ✅ Handle HTTP errors properly
    if (!response.ok) {
      let errorMessage = "Failed to fetch recommendations";

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // ignore JSON parse error
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // ✅ Safety check (always return array)
    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    console.error("Recommendation API Error:", error.message);

    // ✅ Always return empty array (prevents frontend crash)
    return [];
  }
};
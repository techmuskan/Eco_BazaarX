<<<<<<< HEAD
import axios from "axios";

const API_URL = "http://localhost:8080/api";

/**
 * Helper to get Auth Headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

/**
 * GET - All products from database
 */
export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error.response?.data || "Could not fetch products";
  }
};

/**
 * GET - Single product by ID (This was missing!)
 * Matches: GET /api/product/{id}
 */
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/product/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error.response?.data || "Product not found";
  }
};

/**
 * POST - Create product (Admin only)
 */
export const createProduct = async (productData) => {
  try {
    const response = await axios.post(
      `${API_URL}/product`,
      productData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to create product";
  }
};

/**
 * PUT - Update product (Admin only)
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(
      `${API_URL}/product/${id}`,
      productData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to update product";
  }
};

/**
 * DELETE - Remove product (Admin only)
 */
export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/product/${id}`, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to delete product";
  }
};

/**
 * SEARCH - Search products
 */
export const searchProducts = async (keyword) => {
  try {
    const response = await axios.get(`${API_URL}/products/search`, {
      params: { keyword },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Search failed";
  }
};
=======
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
const PRODUCT_API_URL = `${API_BASE_URL}/products`;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(response, fallbackMessage) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = data?.message || data?.error || fallbackMessage;
    throw new Error(message);
  }

  return data;
}

export async function getProducts() {
  let response;
  try {
    response = await fetch(PRODUCT_API_URL, {
      headers: {
        ...getAuthHeaders()
      }
    });
  } catch {
    throw new Error(
      `Cannot reach backend API at ${API_BASE_URL}. Ensure backend is running.`
    );
  }

  const data = await parseResponse(response, "Failed to load products");
  return Array.isArray(data) ? data : [];
}

export async function getProductById(productId) {
  let response;
  try {
    response = await fetch(`${PRODUCT_API_URL}/${productId}`, {
      headers: {
        ...getAuthHeaders()
      }
    });
  } catch {
    throw new Error(
      `Cannot reach backend API at ${API_BASE_URL}. Ensure backend is running.`
    );
  }

  return parseResponse(response, "Failed to load product");
}

export async function createProduct(productData) {
  let response;
  try {
    response = await fetch(PRODUCT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(productData)
    });
  } catch {
    throw new Error(
      `Cannot reach backend API at ${API_BASE_URL}. Ensure backend is running.`
    );
  }

  return parseResponse(response, "Failed to create product");
}

export async function updateProduct(productId, productData) {
  let response;
  try {
    response = await fetch(`${PRODUCT_API_URL}/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(productData)
    });
  } catch {
    throw new Error(
      `Cannot reach backend API at ${API_BASE_URL}. Ensure backend is running.`
    );
  }

  return parseResponse(response, "Failed to update product");
}

export async function deleteProduct(productId) {
  let response;
  try {
    response = await fetch(`${PRODUCT_API_URL}/${productId}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeaders()
      }
    });
  } catch {
    throw new Error(
      `Cannot reach backend API at ${API_BASE_URL}. Ensure backend is running.`
    );
  }

  await parseResponse(response, "Failed to delete product");
}
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4

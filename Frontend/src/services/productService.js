import sampleProducts from "../data/sampleProducts";

const STORAGE_KEY = "ecobazaarx_products";

export function getProducts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProducts));
    return sampleProducts;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return sampleProducts;
    return parsed;
  } catch (error) {
    return sampleProducts;
  }
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function getProductById(id) {
  return getProducts().find((product) => product.id === id);
}

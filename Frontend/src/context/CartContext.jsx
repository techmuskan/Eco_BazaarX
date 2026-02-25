import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ecobazaar_cart_v1";

const CartContext = createContext(null);

function parseMoney(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * 100) / 100;
}

function parseEmission(product) {
  const emission = Number(product?.carbonData?.totalCO2ePerKg || 0);
  return Number.isFinite(emission) ? emission : 0;
}

function normalizeProduct(product) {
  return {
    productId: product.id,
    name: product.name || "Unnamed Product",
    category: product.category || "Uncategorized",
    seller: product.seller || "Unknown Seller",
    image: product.image || "https://via.placeholder.com/600x400?text=EcoBazaar",
    description: product.description || "",
    isEcoFriendly: Boolean(product.isEcoFriendly),
    price: parseMoney(product.price),
    emission: parseEmission(product)
  };
}

function readInitialCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readInitialCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    const quantity = Number(qty);
    if (!product || !Number.isFinite(quantity) || quantity <= 0) return;

    const normalized = normalizeProduct(product);
    setItems(prev => {
      const existing = prev.find(item => item.productId === normalized.productId);
      if (existing) {
        return prev.map(item =>
          item.productId === normalized.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...normalized, quantity }];
    });
  };

  const updateQuantity = (productId, qty) => {
    const quantity = Number(qty);
    if (!Number.isFinite(quantity)) return;
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.productId !== productId));
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = productId => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const replaceCartItem = (productId, replacementProduct) => {
    if (!replacementProduct) return;
    const replacement = normalizeProduct(replacementProduct);

    setItems(prev => {
      const source = prev.find(item => item.productId === productId);
      if (!source) return prev;

      const withoutSource = prev.filter(item => item.productId !== productId);
      const target = withoutSource.find(item => item.productId === replacement.productId);

      if (target) {
        return withoutSource.map(item =>
          item.productId === replacement.productId
            ? { ...item, quantity: item.quantity + source.quantity }
            : item
        );
      }

      return [...withoutSource, { ...replacement, quantity: source.quantity }];
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const metrics = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = parseMoney(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
    const totalEmission = parseMoney(
      items.reduce((sum, item) => sum + item.emission * item.quantity, 0)
    );
    const avgEmission = totalItems ? parseMoney(totalEmission / totalItems) : 0;

    return {
      totalItems,
      subtotal,
      totalEmission,
      avgEmission
    };
  }, [items]);

  const value = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    replaceCartItem,
    clearCart,
    ...metrics
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import MainNavbar from "./MainNavbar";
import { getProducts } from "../services/productService";
import "../styles/CartCheckout.css";

function round(value) {
  return Math.round(value * 100) / 100;
}

function findGreenerAlternatives(cartItems, products) {
  const alternatives = [];

  cartItems.forEach(item => {
    const itemEmission = Number(item.emission || 0);
    const lowerImpact = products
      .filter(product => {
        const emission = Number(product?.carbonData?.totalCO2ePerKg || 0);
        return (
          product.id !== item.productId &&
          (product.category || "") === item.category &&
          emission > 0 &&
          emission < itemEmission
        );
      })
      .sort((a, b) => {
        const ea = Number(a?.carbonData?.totalCO2ePerKg || 0);
        const eb = Number(b?.carbonData?.totalCO2ePerKg || 0);
        if (ea !== eb) return ea - eb;
        return Number(a.price || 0) - Number(b.price || 0);
      });

    if (!lowerImpact.length) return;

    const best = lowerImpact[0];
    const savedPerUnit = Math.max(
      0,
      itemEmission - Number(best?.carbonData?.totalCO2ePerKg || 0)
    );

    alternatives.push({
      sourceProductId: item.productId,
      sourceName: item.name,
      quantity: item.quantity,
      replacement: best,
      estimatedSaving: round(savedPerUnit * item.quantity)
    });
  });

  return alternatives;
}

function CartPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    items,
    totalItems,
    subtotal,
    totalEmission,
    avgEmission,
    updateQuantity,
    removeFromCart,
    replaceCartItem
  } = useCart();
  const [products, setProducts] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [recError, setRecError] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setLoadingRecs(true);
      setRecError("");
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      setRecError(e.message || "Could not load alternatives");
    } finally {
      setLoadingRecs(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const alternatives = useMemo(
    () => findGreenerAlternatives(items, products),
    [items, products]
  );

  const potentialSavings = useMemo(
    () => round(alternatives.reduce((sum, row) => sum + row.estimatedSaving, 0)),
    [alternatives]
  );

  return (
    <main className="checkout-page">
      <MainNavbar />
      <section className="checkout-shell">
        <header className="checkout-hero">
          <div>
            <p className="hero-kicker">Module 3</p>
            <h1>Smart Cart</h1>
            <p>Real-time cost and CO2 visibility before checkout.</p>
          </div>
          <div className="hero-actions">
            <button className="outline-btn" onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
            <button
              className="primary-btn"
              onClick={() => navigate("/checkout")}
              disabled={!items.length}
            >
              Proceed to Checkout
            </button>
          </div>
        </header>

        <section className="checkout-grid">
          <article className="card-panel">
            <div className="panel-head">
              <h2>Cart Items</h2>
              <p>{totalItems} item(s)</p>
            </div>

            {!items.length && (
              <div className="empty-box">
                <h3>Your cart is empty</h3>
                <p>Add eco products and compare impact before placing an order.</p>
                <Link to="/products" className="primary-link">
                  Explore Catalog
                </Link>
              </div>
            )}

            <div className="cart-list">
              {items.map(item => (
                <article key={item.productId} className="cart-row">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={e => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/600x400?text=EcoBazaar";
                    }}
                  />
                  <div className="cart-info">
                    <h3>{item.name}</h3>
                    <p>
                      {item.category} • ${item.price.toFixed(2)} each
                    </p>
                    <p className="sub-meta">
                      {item.emission.toFixed(2)} kg CO2e per item
                    </p>
                  </div>
                  <div className="cart-qty">
                    <button
                      aria-label={`Decrease quantity for ${item.name}`}
                      onClick={() => {
                        updateQuantity(item.productId, item.quantity - 1);
                      }}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Increase quantity for ${item.name}`}
                      onClick={() => {
                        updateQuantity(item.productId, item.quantity + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-cost">
                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                    <p>{(item.emission * item.quantity).toFixed(2)} kg CO2e</p>
                    <button
                      className="tiny-link danger"
                      onClick={() => {
                        removeFromCart(item.productId);
                        showToast(`${item.name} removed from cart.`, "info");
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <aside className="card-panel summary-panel">
            <h2>Live Summary</h2>
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div className="summary-line">
              <span>Total Emissions</span>
              <strong>{totalEmission.toFixed(2)} kg CO2e</strong>
            </div>
            <div className="summary-line">
              <span>Avg per Item</span>
              <strong>{avgEmission.toFixed(2)} kg CO2e</strong>
            </div>
            {potentialSavings > 0 && (
              <p className="saving-pill">
                Potential reduction with suggested swaps: {potentialSavings.toFixed(2)} kg
                CO2e
              </p>
            )}
          </aside>
        </section>

        <section className="card-panel alt-panel">
          <div className="panel-head">
            <h2>Greener Alternatives</h2>
            <p>Suggested before checkout</p>
          </div>

          {loadingRecs && <p className="muted">Loading alternatives...</p>}
          {recError && <p className="error-line">{recError}</p>}
          {recError && (
            <button className="text-btn" type="button" onClick={loadProducts}>
              Retry Alternatives
            </button>
          )}
          {!loadingRecs && !alternatives.length && (
            <p className="muted">Your cart already contains best-in-category options.</p>
          )}

          <div className="alt-grid">
            {alternatives.map(option => (
              <article key={option.sourceProductId} className="alt-card">
                <p className="swap-label">Swap suggestion</p>
                <h3>{option.replacement.name}</h3>
                <p className="muted">
                  Replace <strong>{option.sourceName}</strong> x {option.quantity}
                </p>
                <div className="impact-compare">
                  <span>
                    {(option.replacement?.carbonData?.totalCO2ePerKg || 0).toFixed(2)} kg CO2e
                  </span>
                  <strong>-{option.estimatedSaving.toFixed(2)} kg saved</strong>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => {
                    replaceCartItem(option.sourceProductId, option.replacement);
                    showToast("Cart updated with greener alternative.", "success");
                  }}
                >
                  Use This Alternative
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default CartPage;

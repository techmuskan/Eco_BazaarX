import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import { getProducts } from "../services/productService";
import { getCatalogPathForRole, getCheckoutPathForRole, getProductDetailPath } from "../utils/roleAccess";
import { buildCartSwitchSuggestion } from "../utils/sustainability";
import "../styles/CartPage.css";

function CartPage() {
  const {
    items,
    cartId,
    loading,
    removeFromCart,
    updateQuantity,
    totalEmission,
    subtotal
  } = useCart();

  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      }
    };

    loadProducts();
  }, []);

  const switchSuggestion = useMemo(() => buildCartSwitchSuggestion(items, products), [items, products]);

  if (loading) return (
    <div className="cart-loader">
       <div className="spinner"></div>
       <p>Loading your eco-cart...</p>
    </div>
  );

  if (!items || items.length === 0)
    return (
      <div className="cart-container">
        <MainNavbar />
        <div className="empty-cart-view">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <button className="continue-btn" onClick={() => navigate(getCatalogPathForRole("USER"))}>
            Start Shopping
          </button>
        </div>
      </div>
    );

  const shipping = subtotal > 500 ? 0 : 40;
  const total = subtotal + shipping;

  return (
    <div className="cart-container">
      <MainNavbar />

      <div className="cart-content">
        <div className="cart-items">
          <h2 className="cart-title">My Shopping Cart ({items.length})</h2>

          {items.map((item) => {
            const imageSrc = item.image;
            // ✅ Use the emission directly from backend
            const itemEmission = item.emission || 0;

            return (
              <div key={item.itemId || item.productId} className="cart-item-card">
                <img
                  src={imageSrc || "https://via.placeholder.com/150?text=No+Image"}
                  alt={item.productName}
                  className="cart-product-img"
                />

                <div className="cart-item-details">
                  <div className="item-header">
                      <h3>{item.productName}</h3>
                      <p className="item-category">{item.category || "General"}</p>
                  </div>
                  
                  <div className="item-stats-row">
                    <p className="price">₹{Number(item.subtotal ?? item.price ?? 0).toFixed(2)}</p>
                    <p className="item-carbon-tag">
                      <i className="fa-solid fa-leaf"></i> 
                      {/* ✅ FIXED: Removed * quantity here */}
                      {itemEmission.toFixed(2)} kg CO2e
                    </p>
                  </div>

                  <div className="cart-controls">
                      <div className="qty-section">
                      <button
                          className="qty-btn"
                          onClick={() => item.quantity === 1 ? removeFromCart(item.itemId) : updateQuantity(item.productId, -1)}
                      > − </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.productId, 1)}
                      > + </button>
                      </div>

                      <button className="remove-btn" onClick={() => removeFromCart(item.itemId)}>
                        Remove
                      </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <div className="carbon-summary-box">
            <h4><i className="fa-solid fa-cloud"></i> Environmental Impact</h4>
            <div className="summary-row">
              <span>Total Carbon Footprint</span>
              <span className="carbon-value">{totalEmission.toFixed(2)} kg CO2e</span>
            </div>
            <p className="eco-message">
              {totalEmission < 5 ? "🌱 This is a low-impact cart!" : "Consider greener alternatives to lower this score."}
            </p>
          </div>

          {switchSuggestion && (
            <div className="switch-suggestion-box">
              <p className="switch-kicker">Smart switch suggestion</p>
              <h4>Swap {switchSuggestion.source.productName} for {switchSuggestion.alternative.name}</h4>
              <p className="switch-copy">
                This single change could save <strong>{switchSuggestion.savings.toFixed(2)} kg CO2e</strong> and
                move your cart from <strong>{switchSuggestion.currentTotal.toFixed(2)} kg</strong> to{" "}
                <strong>{switchSuggestion.projectedTotal.toFixed(2)} kg</strong>.
              </p>
              <div className="switch-metrics">
                <span>Current item: {Number(switchSuggestion.source.emission || 0).toFixed(2)} kg</span>
                <span>Alternative: {Number(switchSuggestion.alternative.emission || 0).toFixed(2)} kg</span>
                <span>{switchSuggestion.alternativeBand.label}</span>
              </div>
              <button
                className="switch-action-btn"
                onClick={() => navigate(getProductDetailPath(switchSuggestion.alternative.id))}
              >
                Review better option
              </button>
            </div>
          )}

          <div className="summary-divider"></div>

          <h3>Price Details</h3>
          <div className="summary-row">
            <span>Price ({items.length} items)</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Charges</span>
            <span className={shipping === 0 ? "free-text" : ""}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
            </span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total">
            <span>Total Amount</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          
          <button className="checkout-btn" onClick={() => navigate(getCheckoutPathForRole(), { state: { cartId } })}>
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;

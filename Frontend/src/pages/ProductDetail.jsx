import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import MainNavbar from "../components/MainNavbar";
import { getProductById } from "../services/productService";
import { getRecommendations } from "../services/recommendationService";
import "../styles/ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const { items: cartItems = [], addToCart, updateQuantity, removeFromCart } = useCart();
  const { showToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      const detail = await getProductById(id);
      setProduct(detail);
    } catch (e) {
      showToast("Unable to retrieve product details.", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadDetail();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);
  useEffect(() => {
    if (!product?.id) return;

    const fetchRecommendations = async () => {
      try {
        setRecLoading(true);
        const data = await getRecommendations(product.id);
        setRecommendations(data);
      } catch (error) {
        console.error(error);
        showToast("Failed to load recommendations", "error");
      } finally {
        setRecLoading(false);
      }
    };

    fetchRecommendations();
  }, [product?.id]);

  const getQuantity = (productId) =>
    cartItems.find((i) => i.productId === productId)?.quantity || 0;

  const handleCartAction = async (type) => {
    try {
      if (type === "increment") {
        productQty > 0
          ? await updateQuantity(product.id, 1)
          : await addToCart(product.id, 1);
      } else {
        productQty === 1
          ? await removeFromCart(
            cartItems.find((i) => i.productId === product.id).itemId
          )
          : await updateQuantity(product.id, -1);
      }
      showToast(type === "increment" ? "Cart updated" : "Item removed", "success");
    } catch {
      showToast("Could not update cart.", "error");
    }
  };

  if (loading)
    return (
      <div className="page-loader">
        <div className="spinner"></div>
      </div>
    );

  if (!product) return <div className="error-state">Product not found.</div>;

  const productQty = getQuantity(product.id);
  const emission = Number(product?.carbonData?.totalCO2ePerKg || 0);

  return (
    <main className="premium-product-page">
      <MainNavbar />

      <div className="product-viewport">
        {/* Gallery */}
        <section className="product-gallery">
          <div className="main-image-wrapper">
            <img src={product.image} alt={product.name} className="hero-image" />
          </div>
          <div className="trust-signals">
            <span><i className="fa-solid fa-shield-check"></i> 2-Year Warranty</span>
            <span><i className="fa-solid fa-truck-fast"></i> Carbon-Neutral Shipping</span>
          </div>
        </section>

        {/* Info */}
        <section className="product-sidebar">
          <header className="product-header">
            <nav className="category-crumb">
              <span className="crumb-text">{product.category} / {product.seller}</span>
              <Link to="/products" className="back-link">← Back to catalog</Link>
            </nav>

            <h1 className="product-title">{product.name}</h1>

            <div className="price-row">
              <span className="current-price">₹{Number(product.price).toFixed(2)}</span>
              <span className="tax-note">Excl. shipping and local taxes</span>
            </div>
          </header>

          <div className="purchase-controls">
            {productQty > 0 ? (
              <div className="premium-qty-selector">
                <button onClick={() => handleCartAction("decrement")}>—</button>
                <span className="qty-count">{productQty}</span>
                <button onClick={() => handleCartAction("increment")}>+</button>
              </div>
            ) : (
              <button className="primary-buy-btn" onClick={() => handleCartAction("increment")}>
                Add to Cart
              </button>
            )}

            <button
              className={`wishlist-action ${isInWishlist(product.id) ? "active" : ""}`}
              onClick={() => toggleWishlist(product)}
            >
              {isInWishlist(product.id) ? "♥ In Wishlist" : "♡ Add to Wishlist"}
            </button>
          </div>

          <div className="description-block">
            <h3>Overview</h3>
            <p>{product.description}</p>
          </div>

          {/* Sustainability */}
          <div className="impact-card">
            <div className="impact-header">
              <i className="fa-solid fa-leaf"></i>
              <h4>Sustainability Footprint</h4>
            </div>

            <div className="impact-body">
              <div className="stat-line">
                <span className="label">Carbon Intensity</span>
                <span className="value">{emission.toFixed(2)} kg CO2e / unit</span>
              </div>

              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${Math.min(emission * 20, 100)}%` }}
                ></div>
              </div>

              <p className="impact-footer">
                This item ranks in the <strong>top 15%</strong> for environmental efficiency.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ✅ SPECIFICATIONS KEPT */}
      <section className="specs-section">
        <div className="specs-container">
          <h2>Specifications</h2>
          <div className="specs-grid">
            <div className="spec-item">
              <label>Origin</label>
              <span>Sustainably Sourced</span>
            </div>
            <div className="spec-item">
              <label>Packaging</label>
              <span>100% Recyclable Paper</span>
            </div>
            <div className="spec-item">
              <label>Material</label>
              <span>Eco-Certified Composite</span>
            </div>
            <div className="spec-item">
              <label>Life Cycle</label>
              <span>Compostable</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="recommendation-section">
        <h2>🌱 Better Eco Alternatives</h2>

        <div className="recommendation-grid">
          {recLoading ? (
            <p>Loading recommendations...</p>
          ) : recommendations.length === 0 ? (
            <p>No recommendations available</p>
          ) : (
            recommendations.map((item) => (
              <div key={item.productId} className="recommendation-card">

                {/* ✅ Product Image */}
                <div className="rec-image-wrapper">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.productName}
                    className="rec-image"
                  />
                </div>

                <h4>{item.productName}</h4>

                <p>₹{item.price}</p>

                <p className="carbon">
                  🌍 {item.carbonFootprint ? item.carbonFootprint.toFixed(2) : "0.00"} kg CO2
                </p>

                <p className="eco">
                  🌿 {item.ecoScore === 1 ? "Eco-Friendly Product" : "Standard Product"}
                </p>

                <p className="score">
                  ⭐ Score: {item.score ? item.score.toFixed(1) : "0.0"}
                </p>

                {item.score > 60 && (
                  <span className="best-badge">🔥 Best Choice</span>
                )}

                {item.carbonFootprint < emission && (
                  <p className="better">
                    ✅ Saves {(emission - item.carbonFootprint).toFixed(2)} kg CO₂
                  </p>
                )}

                <Link to={`/products/${item.productId}`} className="view-btn">
                  View
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default ProductDetail;
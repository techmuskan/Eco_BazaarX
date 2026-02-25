import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import MainNavbar from "./MainNavbar";
import { getProductById, getProducts } from "../services/productService";
import "../styles/ProductDetail.css";

function getRating(total) {
  if (total <= 1.5) return { label: "A+", tone: "best" };
  if (total <= 2.5) return { label: "A", tone: "great" };
  if (total <= 3.8) return { label: "B", tone: "good" };
  if (total <= 5) return { label: "C", tone: "warn" };
  return { label: "D", tone: "risk" };
}

function ProductDetail() {
  const { id } = useParams();
  const { addToCart, totalItems } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [detail, all] = await Promise.all([getProductById(id), getProducts()]);
      setProduct(detail);
      setProducts(all);
    } catch (e) {
      setError(e.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const emission = Number(product?.carbonData?.totalCO2ePerKg || 0);
  const rating = getRating(emission);
  const breakdown = product?.carbonData?.breakdown || {};

  const alternatives = useMemo(() => {
    if (!product) return [];
    return products
      .filter(candidate => {
        const candidateEmission = Number(candidate?.carbonData?.totalCO2ePerKg || 0);
        return (
          candidate.id !== product.id &&
          candidate.category === product.category &&
          candidateEmission > 0 &&
          candidateEmission < emission
        );
      })
      .sort((a, b) => {
        const ea = Number(a?.carbonData?.totalCO2ePerKg || 0);
        const eb = Number(b?.carbonData?.totalCO2ePerKg || 0);
        return ea - eb;
      })
      .slice(0, 3);
  }, [product, products, emission]);

  if (loading) {
    return (
      <main className="detail-page">
        <MainNavbar />
        <section className="detail-shell">
          <div className="detail-skeleton" />
        </section>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="detail-page">
        <section className="detail-shell">
          <p className="error-line">{error || "Product not found"}</p>
          <Link to="/products" className="back-btn">
            Back to catalog
          </Link>
          <button className="detail-page primary-btn" onClick={loadDetail}>
            Retry
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <MainNavbar />
      <section className="detail-shell">
        <div className="detail-topbar">
          <Link to="/products" className="back-btn">
            Back to catalog
          </Link>
          <Link to="/cart" className="cart-pill">
            Cart ({totalItems})
          </Link>
        </div>

        <article className="detail-main">
          <img
            src={product.image || "https://via.placeholder.com/700x500?text=EcoBazaar"}
            alt={product.name}
            loading="lazy"
            onError={e => {
              e.currentTarget.src = "https://via.placeholder.com/700x500?text=EcoBazaar";
            }}
          />
          <div className="detail-content">
            <div className="head-row">
              <h1>{product.name}</h1>
              <span className={`eco-tag ${rating.tone}`}>{rating.label}</span>
            </div>
            <p className="subtitle">
              {product.category || "General"} • {product.seller || "EcoBazaar Seller"}
            </p>
            <p className="description">{product.description || "No description available."}</p>
            <p className="price-line">${Number(product.price || 0).toFixed(2)}</p>
            <button
              className="primary-btn"
              onClick={() => {
                addToCart(product, 1);
                showToast(`${product.name} added to cart.`, "success");
              }}
            >
              Add to Cart
            </button>

            <section className="impact-breakdown">
              <h2>Impact Breakdown</h2>
              <div className="impact-grid">
                <article>
                  <p>Total CO2e</p>
                  <strong>{emission.toFixed(2)} kg / item</strong>
                </article>
                <article>
                  <p>Manufacturing</p>
                  <strong>{Number(breakdown.manufacturing || 0).toFixed(2)} kg</strong>
                </article>
                <article>
                  <p>Packaging</p>
                  <strong>{Number(breakdown.packaging || 0).toFixed(2)} kg</strong>
                </article>
                <article>
                  <p>Transport + Handling</p>
                  <strong>
                    {(
                      Number(breakdown.transport || 0) + Number(breakdown.handling || 0)
                    ).toFixed(2)}{" "}
                    kg
                  </strong>
                </article>
              </div>
            </section>
          </div>
        </article>

        <section className="alt-section">
          <div className="panel-head">
            <h2>Greener Alternatives</h2>
            <p>Lower-emission products in the same category</p>
          </div>
          <div className="alt-grid">
            {alternatives.map(alt => (
              <article className="alt-card" key={alt.id}>
                <h3>{alt.name}</h3>
                <p>{Number(alt?.carbonData?.totalCO2ePerKg || 0).toFixed(2)} kg CO2e / item</p>
                <button
                  className="primary-btn"
                  onClick={() => {
                    addToCart(alt, 1);
                    showToast(`${alt.name} alternative added.`, "success");
                  }}
                >
                  Add Alternative
                </button>
              </article>
            ))}
            {!alternatives.length && (
              <p className="muted">No greener alternatives found for this category right now.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default ProductDetail;

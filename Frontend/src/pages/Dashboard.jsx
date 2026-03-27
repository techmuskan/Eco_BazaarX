import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import { useCart } from "../context/CartContext";
import { getStoredUser } from "../services/authService";
import { getProducts } from "../services/productService";
import { getAdminManagementPath, getCartPathForRole, getCatalogPathForRole, getInsightsPathForRole, getProductDetailPath } from "../utils/roleAccess";
import { getEmissionBand } from "../utils/sustainability";
import "../styles/Dashboard.css";

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const user = getStoredUser();
  const { items: cartItems = [], totalEmission = 0 } = useCart();
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

  const visibleProducts = useMemo(
    () => products.filter((product) => !product.status || product.status === "Approved"),
    [products]
  );

  const featuredProducts = useMemo(
    () => [...visibleProducts].sort((a, b) => (a.emission ?? 0) - (b.emission ?? 0)).slice(0, 3),
    [visibleProducts]
  );

  if (!user) return <div className="loading">Loading...</div>;

  const dashboardTone = getEmissionBand(totalEmission || 0);
  const ecoFriendlyCount = visibleProducts.filter((product) => product.isEcoFriendly).length;
  const averageFootprint = visibleProducts.length
    ? visibleProducts.reduce((sum, product) => sum + Number(product.emission || 0), 0) / visibleProducts.length
    : 0;

  return (
    <>
      <MainNavbar onLogout={onLogout} />

      <div className="dashboard-shell">
        <section className="dashboard-hero">
          <div className="hero-copy">
            <p className="hero-kicker">Impact-led Marketplace</p>
            <h1>{user?.name || "Eco Shopper"}, your next purchase can be measurably better.</h1>
            <p className="hero-summary">
              EcoBazaarX is no longer just a storefront. It now frames shopping as a climate-aware
              operating system: clearer footprint stories, greener substitutes, and live impact
              signals in the same flow.
            </p>
            <div className="dashboard-actions">
              <button className="open-catalog-btn" onClick={() => navigate(getCatalogPathForRole(user?.role))}>
                Explore Greener Products
              </button>
              <button className="secondary-btn" onClick={() => navigate(getInsightsPathForRole())}>
                View My Carbon Story
              </button>
            </div>
          </div>

          <div className="hero-panel">
            <div className={`signal-card signal-${dashboardTone.tone}`}>
              <span>Current Shopping Pulse</span>
              <strong>{dashboardTone.label}</strong>
              <p>{totalEmission.toFixed(1)} kg CO2e currently sitting in your active cart journey.</p>
            </div>

            <div className="signal-grid">
              <article>
                <span>Visible low-impact SKUs</span>
                <strong>{ecoFriendlyCount}</strong>
              </article>
              <article>
                <span>Cart load</span>
                <strong>{cartItems.length} items</strong>
              </article>
              <article>
                <span>Average product footprint</span>
                <strong>{averageFootprint.toFixed(1)} kg</strong>
              </article>
              <article>
                <span>Access tier</span>
                <strong>{user?.role || "USER"}</strong>
              </article>
            </div>
          </div>
        </section>

        <section className="mission-strip">
          <article>
            <h3>Transparent by design</h3>
            <p>Every product can now tell a clearer footprint story, not just show a price tag.</p>
          </article>
          <article>
            <h3>Actionable alternatives</h3>
            <p>Recommendations are framed by carbon savings so greener choices feel intentional.</p>
          </article>
          <article>
            <h3>Operator-grade control</h3>
            <p>Admins can review held products and shape the catalog instead of flying blind.</p>
          </article>
        </section>

        <section className="featured-lab">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Curated Now</p>
              <h2>Low-impact standouts in the current catalog</h2>
            </div>
            {user?.role === "ADMIN" ? (
              <button className="secondary-btn admin-btn" onClick={() => navigate(getAdminManagementPath())}>
                Open Admin Review
              </button>
            ) : (
              <button className="secondary-btn admin-btn" onClick={() => navigate(getCartPathForRole())}>
                Review Cart Impact
              </button>
            )}
          </div>

          <div className="featured-grid">
            {featuredProducts.map((product) => {
              const band = getEmissionBand(Number(product.emission || 0));

              return (
                <article key={product.id} className="featured-card">
                  <div className="featured-image-wrap">
                    <img src={product.image} alt={product.name} />
                    <span className={`featured-badge featured-${band.tone}`}>{band.label}</span>
                  </div>
                  <div className="featured-copy">
                    <p className="featured-category">{product.category}</p>
                    <h3>{product.name}</h3>
                    <p>
                      {Number(product.emission || 0).toFixed(1)} kg CO2e and sold by {product.seller}.
                    </p>
                    <button className="text-link-btn" onClick={() => navigate(getProductDetailPath(product.id))}>
                      Open footprint breakdown
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

export default Dashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import BackButton from "../components/BackButton";
import { fetchSellerProducts } from "../services/sellerService";
import { getAddProductPathForRole, getDashboardPathForRole, getEditProductPathForRole } from "../utils/roleAccess";
import "../styles/SellerDashboard.css";

function SellerProducts({ onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchSellerProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <>
      <MainNavbar onLogout={onLogout} />
      <div className="seller-dashboard">
        <section className="seller-hero">
          <BackButton fallbackTo={getDashboardPathForRole("SELLER")} label="Back" className="seller-back-button" />
          <div>
            <p className="seller-kicker">Seller Products</p>
            <h1>Manage your listings in one dedicated workspace.</h1>
            <p>Review status, pricing, and edit access for every product linked to your store.</p>
          </div>
          <div className="seller-actions">
            <button onClick={() => navigate(getAddProductPathForRole("SELLER"))}>Add Product</button>
          </div>
        </section>

        <section className="seller-panel">
          <h2>All seller listings</h2>
          {loading ? (
            <p className="seller-empty">Loading products...</p>
          ) : products.length > 0 ? (
            <div className="seller-collection">
              {products.map((product) => (
                <div className="seller-collection-item" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{product.category || "Uncategorized"} · ₹{product.price}</p>
                  </div>
                  <div className="seller-inline-actions">
                    <span className={`seller-status ${String(product.status || "Hold").toLowerCase()}`}>
                      {product.status || "Hold"}
                    </span>
                    <button
                      className="seller-table-btn"
                      onClick={() => navigate(getEditProductPathForRole("SELLER", product.id))}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="seller-empty">No listings yet. Add your first product to start your storefront.</p>
          )}
        </section>
      </div>
    </>
  );
}

export default SellerProducts;

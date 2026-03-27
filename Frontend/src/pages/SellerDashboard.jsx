import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import { getStoredUser } from "../services/authService";
import { fetchSellerDashboard } from "../services/sellerService";
import { getAddProductPathForRole, getCatalogPathForRole, getSellerOrdersPath, getSellerProductsPath, getSellerProfilePath } from "../utils/roleAccess";
import "../styles/SellerDashboard.css";

function SellerDashboard({ onLogout }) {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const data = await fetchSellerDashboard();
        setWorkspace(data || null);
      } catch {
        setWorkspace(null);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, []);

  const sellerName = user?.name || "Seller";
  const products = workspace?.recentProducts || [];
  const orders = workspace?.recentOrders || [];
  const storeName = workspace?.storeName || sellerName;
  const approvedCount = useMemo(
    () => workspace?.approvedListings ?? 0,
    [workspace]
  );
  const holdCount = useMemo(
    () => workspace?.pendingListings ?? 0,
    [workspace]
  );
  const ecoCatalogCount = useMemo(
    () => workspace?.ecoListings ?? 0,
    [workspace]
  );
  const isApprovedSeller = workspace?.approved === true;

  if (loading) {
    return (
      <>
        <MainNavbar onLogout={onLogout} />
        <div className="seller-dashboard">
          <div className="seller-loading">Loading seller workspace...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <MainNavbar onLogout={onLogout} />
      <div className="seller-dashboard">
        <section className="seller-hero">
          <div>
            <p className="seller-kicker">Seller Workspace</p>
            <h1>{sellerName}, manage your storefront like an operator.</h1>
            <p>
              {storeName} is now running on seller-scoped data: your own listings, your own order
              book, and the moderation status that matters to your storefront.
            </p>
            {!isApprovedSeller && (
              <p className="seller-empty">
                Your seller account is pending admin approval. You can update your store profile now,
                but product creation stays locked until approval.
              </p>
            )}
          </div>
          <div className="seller-actions">
            <button
              onClick={() => navigate(getAddProductPathForRole("SELLER"))}
              disabled={!isApprovedSeller}
              title={!isApprovedSeller ? "Seller approval is required before adding products" : "Add Product"}
            >
              Add Product
            </button>
            <button className="ghost" onClick={() => navigate(getCatalogPathForRole("SELLER"))}>
              Review Catalog
            </button>
          </div>
        </section>

        <section className="seller-grid">
          <article className="seller-card">
            <span>Approved listings</span>
            <strong>{approvedCount}</strong>
            <p>Products already ready for buyers to discover.</p>
          </article>
          <article className="seller-card">
            <span>Hold / review queue</span>
            <strong>{holdCount}</strong>
            <p>Listings that still need moderation, edits, or eco validation.</p>
          </article>
          <article className="seller-card">
            <span>Eco-active SKUs</span>
            <strong>{ecoCatalogCount}</strong>
            <p>Products currently carrying an eco-friendly signal in the catalog.</p>
          </article>
          <article className="seller-card">
            <span>Seller revenue</span>
            <strong>₹{Number(workspace?.sellerRevenue || 0).toFixed(0)}</strong>
            <p>Revenue attributed to items sold from your own storefront.</p>
          </article>
        </section>

        <section className="seller-panel-wrap">
          <article className="seller-panel accent">
            <h2>Seller console</h2>
            <div className="seller-checklist">
              <div>
                <strong>Products workspace</strong>
                <p>Open your full listing manager with edit access and status visibility.</p>
              </div>
              <div>
                <strong>Orders workspace</strong>
                <p>Track buyer orders, unit counts, and attributed seller revenue.</p>
              </div>
              <div>
                <strong>Store profile</strong>
                <p>Maintain the store identity buyers and admins see across the platform.</p>
              </div>
              <div className="seller-console-actions">
                <button type="button" className="seller-table-btn" onClick={() => navigate(getSellerProductsPath())}>
                  Open Products
                </button>
                <button type="button" className="seller-table-btn" onClick={() => navigate(getSellerOrdersPath())}>
                  Open Orders
                </button>
                <button type="button" className="seller-table-btn" onClick={() => navigate(getSellerProfilePath())}>
                  Open Store Profile
                </button>
              </div>
            </div>
          </article>
        </section>

        <section className="seller-panel-wrap">
          <article className="seller-panel">
            <h2>Your latest listings</h2>
            {products.length > 0 ? (
              <div className="seller-collection">
                {products.map((product) => (
                  <div className="seller-collection-item" key={product.id}>
                    <div>
                      <strong>{product.name}</strong>
                      <p>{product.category || "Uncategorized"} · ₹{product.price}</p>
                    </div>
                    <span className={`seller-status ${String(product.status || "Hold").toLowerCase()}`}>
                      {product.status || "Hold"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="seller-empty">No listings yet. Add your first product to start your storefront.</p>
            )}
            <button className="seller-inline-link" onClick={() => navigate(getSellerProductsPath())}>
              View all seller products
            </button>
          </article>

          <article className="seller-panel accent">
            <h2>Store performance snapshot</h2>
            <div className="seller-checklist">
              <div>
                <strong>Total seller orders</strong>
                <p>{workspace?.totalOrders || 0} orders currently include your products.</p>
              </div>
              <div>
                <strong>Attributed carbon footprint</strong>
                <p>{Number(workspace?.totalEmission || 0).toFixed(2)} kg CO2e shipped through your catalog.</p>
              </div>
              <div>
                <strong>Store identity</strong>
                <p>{storeName}</p>
              </div>
            </div>
          </article>
        </section>

        <section className="seller-panel">
          <h2>Recent seller orders</h2>
          {orders.length > 0 ? (
            <div className="seller-order-list">
              {orders.map((order) => (
                <div className="seller-order-card" key={order.orderId}>
                  <div className="seller-order-head">
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <p>{order.customerName || "Customer"} · {new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`seller-status ${String(order.status || "Processing").toLowerCase()}`}>
                      {order.status || "Processing"}
                    </span>
                  </div>
                  <div className="seller-order-meta">
                    <span>{order.totalUnits} items</span>
                    <span>₹{Number(order.sellerRevenue || 0).toFixed(0)}</span>
                    <span>{Number(order.sellerEmission || 0).toFixed(2)} kg CO2e</span>
                  </div>
                  <div className="seller-order-items">
                    {(order.items || []).map((item, index) => (
                      <span key={`${order.orderId}-${index}`}>
                        {item.productName} x{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="seller-empty">No orders yet. Once buyers purchase your products, they will appear here.</p>
          )}
          <button className="seller-inline-link" onClick={() => navigate(getSellerOrdersPath())}>
            View full seller order stream
          </button>
        </section>
      </div>
    </>
  );
}

export default SellerDashboard;

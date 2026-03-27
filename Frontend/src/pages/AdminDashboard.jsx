import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import { fetchAdminStats, fetchAdminUsers } from "../services/adminService";
import { getProducts } from "../services/productService";
import { getAdminCatalogPath, getAdminManagementPath } from "../utils/roleAccess";
import "../styles/AdminManagement.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [usersResult, productsResult, statsResult] = await Promise.allSettled([
          fetchAdminUsers(),
          getProducts(),
          fetchAdminStats(),
        ]);

        setUsers(usersResult.status === "fulfilled" ? (usersResult.value || []) : []);
        setProducts(productsResult.status === "fulfilled" ? (productsResult.value || []) : []);
        setStats(statsResult.status === "fulfilled" ? statsResult.value : null);

        const firstFailure = [usersResult, productsResult, statsResult]
          .filter((result) => result.status === "rejected")
          .map((result) => result.reason?.message)
          .find(Boolean);

        if (firstFailure) {
          setLoadError(firstFailure);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const monthlyEmissionTrend = stats?.monthlyEmissionTrend || [];
  const categoryBreakdown = stats?.categoryBreakdown || [];
  const orderStatusBreakdown = stats?.orderStatusBreakdown || [];
  const recentOrders = stats?.recentOrders || [];
  const maxTrendValue = Math.max(...monthlyEmissionTrend.map((item) => Number(item.value) || 0), 1);
  const maxCategoryCount = Math.max(...categoryBreakdown.map((item) => Number(item.count) || 0), 1);
  const maxStatusCount = Math.max(...orderStatusBreakdown.map((item) => Number(item.count) || 0), 1);
  const adminCount = useMemo(() => users.filter((user) => user.role === "ADMIN").length, [users]);

  if (loading) return <div className="admin-loading">Connecting to Secure Server...</div>;

  return (
    <>
      <MainNavbar />
      <div className="admin-page">
        {loadError && <div className="admin-load-error" role="alert">{loadError}</div>}

        <header className="admin-hero">
          <div>
            <p className="admin-kicker">Administrator Overview</p>
            <h1>Platform Intelligence & Live Governance Snapshot</h1>
          </div>
          <div className="admin-actions">
            <button className="solid-btn" onClick={() => navigate(getAdminManagementPath())}>
              Open Management
            </button>
            <button className="solid-btn1" onClick={() => navigate(getAdminCatalogPath())}>
              Open Catalog Review
            </button>
          </div>
        </header>

        <section className="admin-card report-card">
          <div className="report-preview">
            <div className="stat-box">
              <span>Total Users</span>
              <strong>{users.length}</strong>
            </div>
            <div className="stat-box">
              <span>Administrators</span>
              <strong>{adminCount}</strong>
            </div>
            <div className="stat-box">
              <span>Green SKUs</span>
              <strong>{stats?.greenSkus || 0}</strong>
            </div>
            <div className="stat-box">
              <span>Total Orders</span>
              <strong>{stats?.totalOrders || 0}</strong>
            </div>
          </div>

          <div className="report-grid">
            <div className="report-panel">
              <h4>Monthly Emission Trend</h4>
              <p>Tracks carbon-impact movement across platform orders by month.</p>
              {monthlyEmissionTrend.length > 0 ? (
                <div className="trend-list">
                  {monthlyEmissionTrend.map((point) => (
                    <div className="trend-row" key={point.label}>
                      <div className="trend-meta">
                        <span>{point.label}</span>
                        <strong>{Number(point.value).toFixed(2)} kg</strong>
                      </div>
                      <div className="trend-bar-track">
                        <div className="trend-bar-fill" style={{ width: `${(Number(point.value) / maxTrendValue) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-report">No emission trend data available yet.</p>
              )}
            </div>

            <div className="report-panel">
              <h4>Catalog Category Mix</h4>
              <p>Shows where the current inventory is concentrated right now.</p>
              {categoryBreakdown.length > 0 ? (
                <div className="trend-list">
                  {categoryBreakdown.map((item) => (
                    <div className="trend-row" key={item.label}>
                      <div className="trend-meta">
                        <span>{item.label}</span>
                        <strong>{item.count}</strong>
                      </div>
                      <div className="trend-bar-track">
                        <div className="trend-bar-fill alt" style={{ width: `${(Number(item.count) / maxCategoryCount) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-report">No category distribution available yet.</p>
              )}
            </div>
          </div>

          <div className="report-grid" style={{ marginTop: "20px" }}>
            <div className="report-panel">
              <h4>Order Status Breakdown</h4>
              <p>Highlights fulfillment pressure points across all recorded orders.</p>
              {orderStatusBreakdown.length > 0 ? (
                <div className="trend-list">
                  {orderStatusBreakdown.map((item) => (
                    <div className="trend-row" key={item.label}>
                      <div className="trend-meta">
                        <span>{item.label}</span>
                        <strong>{item.count}</strong>
                      </div>
                      <div className="trend-bar-track">
                        <div className="trend-bar-fill danger" style={{ width: `${(Number(item.count) / maxStatusCount) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-report">No order status data available yet.</p>
              )}
            </div>

            <div className="report-panel">
              <h4>Operational Snapshot</h4>
              <p>Quick reading of marketplace health from the admin view.</p>
              <div className="snapshot-list">
                <div className="snapshot-item">
                  <span>Total Carbon Impact</span>
                  <strong>{Number(stats?.totalCarbonImpact || 0).toFixed(2)} kg</strong>
                </div>
                <div className="snapshot-item">
                  <span>Inventory Count</span>
                  <strong>{products.length}</strong>
                </div>
                <div className="snapshot-item">
                  <span>Orders per Active Product</span>
                  <strong>{stats?.inventoryCount ? (stats.totalOrders / stats.inventoryCount).toFixed(2) : "0.00"}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-card">
          <h3>Recent User Activity & Item Details</h3>
          <div style={{ overflowX: "auto", maxHeight: "450px", border: "1px solid #f1f5f9", borderRadius: "8px" }}>
            <table className="details-table">
              <thead>
                <tr>
                  <th>Order Date</th>
                  <th>User Name</th>
                  <th>Total Qty</th>
                  <th>Items Ordered</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, idx) => (
                    <tr key={order.id || idx}>
                      <td style={{ color: "#64748b", fontSize: "12px", whiteSpace: "nowrap" }}>
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "Date Missing"}
                      </td>
                      <td><strong>{order.userName || "Guest"}</strong></td>
                      <td style={{ textAlign: "center" }}>{order.totalQuantity || 0}</td>
                      <td>
                        <div className="item-tags">
                          {order.items?.filter(Boolean).map((item, index) => (
                            <span key={index} className="item-tag">
                              {item.name} <small style={{ opacity: 0.7 }}>(x{item.qty})</small>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td><span className={`pill ${order.status?.toUpperCase() || "PENDING"}`}>{order.status || "Pending"}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export default AdminDashboard;

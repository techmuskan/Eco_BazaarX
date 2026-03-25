import { useEffect, useMemo, useState } from "react";
import MainNavbar from "../components/MainNavbar";
import { useNavigate } from "react-router-dom";
import {
  updateProductStatusAPI,
  fetchAdminStats,
  fetchAdminUsers,
  changeUserRole,
  fetchRecentOrders
} from "../services/adminService";
import { getProducts } from "../services/productService";
import "../styles/AdminManagement.css";

const tabs = [
  { id: "users", label: "Users & Roles" },
  { id: "products", label: "Product Catalog" },
  { id: "carbon", label: "Eco-Metrics" },
  { id: "reports", label: "Sustainability Reports" },
  { id: "orderreports", label: "Order Reports" },

];
const downloadTextFile = (filename, content) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

function AdminManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCarbon, setEditingCarbon] = useState(null);

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [u, p, s, o] = await Promise.all([
          fetchAdminUsers(),
          getProducts(),
          fetchAdminStats(),
          fetchRecentOrders()  // now works correctly
        ]);

        setUsers(u || []);
        setProducts(p || []);
        setStats(s);
        setRecentOrders(o || []);
      } catch (err) {
        console.error("Admin data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredUsers = useMemo(() =>
    users.filter(u => (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())),
    [users, searchTerm]);

  const filteredProducts = useMemo(() =>
    products.filter(p => (p.name || p.productName || "").toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]);

  const handleUpdate = async (product, isApproved, carbon = null) => {
    try {
      const payload = {
        id: product.id,
        status: isApproved ? "Approved" : "Hold",
        // FIX: Keep the product's current eco status unless we are specifically 
        // passing a new value (like from the Carbon tab checkbox)
        isEcoFriendly: carbon !== null ? carbon.isEcoFriendly : product.isEcoFriendly,

        manufacturing: carbon?.manufacturing ?? product.carbonData?.breakdown?.manufacturing ?? 0,
        packaging: carbon?.packaging ?? product.carbonData?.breakdown?.packaging ?? 0,
        transport: carbon?.transport ?? product.carbonData?.breakdown?.transport ?? 0,
        handling: carbon?.handling ?? product.carbonData?.breakdown?.handling ?? 0,
      };

      const updated = await updateProductStatusAPI(product.id, payload);

      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingCarbon(null);
      alert(`Product set to ${payload.status}`);
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed: " + err.message);
    }
  };
  const handleReportDownload = () => {
    const content = [
      "EcoBazaarX System Sustainability Report",
      "",
      "Key Metrics",
      `- Active users: ${stats?.totalNormalUsers ?? 0}`,
      // `- Verified sellers: ${sellers.filter((item) => item.status === "verified").length}`,
      `- Green SKUs: ${products.filter((product) => product.isEcoFriendly).length}`,
      `- Carbon savings this quarter: ${products.reduce((acc, item) => acc + (item.emission || 0), 0).toFixed(2)} kg`,
      "",
      "Pending Verifications",
      // ...verifications.map((item) => `- ${item.type} ${item.subject}: ${item.status}`),
    ].join("\n");
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(`sustainability-report-${date}.txt`, content);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Role change failed.");
    }
  };

  if (loading) return <div className="admin-loading">Connecting to Secure Server...</div>;

  return (
    <>
      <MainNavbar />
      <div className="admin-page">
        <header className="admin-hero">
          <div>
            <p className="admin-kicker">Administrator Overview</p>
            <h1>Catalog Control & User Governance</h1>
          </div>
          <button className="solid-btn" title="Click to Download" onClick={handleReportDownload}>
            System Report
          </button>
        </header>

        <div className="admin-tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => { setActiveTab(t.id); setSearchTerm(""); }}>
              {t.label}
            </button>
          ))}
          <button className="solid-btn1" onClick={() => navigate("/add-product")}>+ Add Product</button>
        </div>

        <div className="admin-search-container">
          <input
            className="admin-search"
            placeholder={`Search across ${activeTab}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- USERS TAB --- */}
        {activeTab === "users" && (
          <section className="admin-card">
            <h3>Identity & Access Management</h3>
            <table>
              <thead><tr><th>Full Name</th><th>Email</th><th>Current Role</th><th>Permissions</th></tr></thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={`pill ${u.role}`}>{u.role}</span></td>
                    <td>
                      <select className="role-select" value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* --- PRODUCTS TAB (FIXED ACTION BUTTONS) --- */}
        {activeTab === "products" && (
          <section className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Inventory Verification</h3>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {filteredProducts.length} Items in Catalog
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product Title</th>
                    <th>Current Status</th>
                    <th>Eco-Tag</th>
                    <th style={{ textAlign: 'right' }}>Management Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: '600' }}>{p.name || p.productName}</td>
                        <td>
                          <span className={`pill ${p.status === "Approved" ? "verified" : "pending"}`}>
                            {p.status || "Hold"}
                          </span>
                        </td>
                        <td>
                          <span>{p.isEcoFriendly ? "Active" : "NO"}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {/* Correct class name to match your CSS */}
                          <div className="ad-actions">
                            <button
                              className="ghost-btn approve-btn"
                              onClick={() => handleUpdate(p, true)}
                            >
                              Approve
                            </button>
                            <button
                              className="ghost-btn danger hold-btn"
                              onClick={() => handleUpdate(p, false)}
                            >
                              Hold
                            </button>
                            <button
                              className="ghost-btn"
                              onClick={() => navigate(`/edit-product/${p.id}`)}
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No products found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* --- ECO-METRICS TAB --- */}
        {activeTab === "carbon" && (
          <section className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>LCA Emissions & Verification Control</h3>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Managing {filteredProducts.length} Data Points</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Mfg</th>
                    <th>Pkg</th>
                    <th>Trp</th>
                    <th>Eco-Friendly</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '600' }}>{p.name || p.productName}</td>
                      {editingCarbon?.id === p.id ? (
                        <>
                          <td><input type="number" className="table-input" value={editingCarbon.manufacturing} onChange={e => setEditingCarbon({ ...editingCarbon, manufacturing: e.target.value })} /></td>
                          <td><input type="number" className="table-input" value={editingCarbon.packaging} onChange={e => setEditingCarbon({ ...editingCarbon, packaging: e.target.value })} /></td>
                          <td><input type="number" className="table-input" value={editingCarbon.transport} onChange={e => setEditingCarbon({ ...editingCarbon, transport: e.target.value })} /></td>
                          <td>
                            <input
                              type="checkbox"
                              checked={editingCarbon.isEcoFriendly}
                              onChange={e => setEditingCarbon({ ...editingCarbon, isEcoFriendly: e.target.checked })}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="adm-actions">
                              <button
                                className="solid-btn"
                                style={{ padding: '6px 15px', fontSize: '12px' }}
                                onClick={() => handleUpdate(p, p.status === "Approved", editingCarbon)}
                              >
                                Apply
                              </button>
                              <button
                                className="ghost-btn"
                                style={{ padding: '6px 15px', fontSize: '12px' }}
                                onClick={() => setEditingCarbon(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{p.carbonData?.breakdown?.manufacturing || 0}</td>
                          <td>{p.carbonData?.breakdown?.packaging || 0}</td>
                          <td>{p.carbonData?.breakdown?.transport || 0}</td>
                          <td>{p.isEcoFriendly ? "✅" : "❌"}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="a-actions">
                              <button className="ghost-btn" onClick={() => setEditingCarbon({
                                id: p.id,
                                manufacturing: p.carbonData?.breakdown?.manufacturing || 0,
                                packaging: p.carbonData?.breakdown?.packaging || 0,
                                transport: p.carbonData?.breakdown?.transport || 0,
                                isEcoFriendly: p.isEcoFriendly || false
                              })}>
                                Edit Data
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* --- REPORTS TAB --- */}
        {activeTab === "reports" && stats && (
          <section className="admin-card report-card">
            <div className="report-header">
              <div>
                <h3>Platform Analytics</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '5px 0 0' }}>
                  Real-time sustainability tracking and data exports
                </p>
              </div>
              <button className="solid-btn" title="Click to Download" onClick={handleReportDownload}>
                ECO Report
              </button>
            </div>

            <div className="report-preview">
              {/* Box 1: Focus on the Carbon Value */}
              <div className="stat-box">
                <span>Total Carbon (CO2e)</span>
                <strong>{stats.totalCarbonImpact} kg</strong>
              </div>

              {/* Box 2: Focus on Savings */}
              <div className="stat-box">
                <span>Net Carbon Savings</span>
                <strong>{Math.round(stats.totalCarbonImpact * 0.15)} kg</strong> {/* Example calc or use a specific stat */}
              </div>

              {/* Box 3: Focus on Eco-Friendly Count */}
              <div className="stat-box">
                <span>Total Eco-Friendly Product</span>
                <strong>{stats.greenSkus}</strong>
              </div>

              {/* Box 4: Focus on Inventory count */}
              <div className="stat-box">
                <span>System Inventory</span>
                <strong>{stats.inventoryCount}</strong>
              </div>
            </div>
          </section>
        )}
        {/* --- ORDER REPORTS TAB --- */}
        {activeTab === "orderreports" && stats && (
          <section className="admin-card report-card" style={{ marginTop: '30px' }}>
            <div className="report-header">
              <h3>System Governance & Order Volume</h3>
            </div>

            {/* Overview Stats */}
            <div className="report-preview" style={{ marginBottom: '30px' }}>
              <div className="stat-box secondary"><span>Total Users</span><strong>{users?.length || 0}</strong></div>
              <div className="stat-box secondary"><span>Administrators</span><strong>{users?.filter(u => u.role === 'ADMIN').length || 0}</strong></div>
              <div className="stat-box secondary"><span>Active Products</span><strong>{products?.length || 0}</strong></div>
              <div className="stat-box secondary"><span>Total Orders</span><strong>{stats.totalOrders || 0}</strong></div>
            </div>

            {/* Detailed Order Breakdown */}
            <div className="order-details-section">
              <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Recent User Activity & Item Details</h4>
              <div style={{ overflowX: 'auto', maxHeight: '450px', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>Order Date</th>
                      <th style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>User Name</th>
                      <th style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>Total Qty</th>
                      <th style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>Items Ordered</th>
                      <th style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders && recentOrders.length > 0 ? (
                      recentOrders.map((order, idx) => (
                        <tr key={order.id || idx}>
                          <td style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                            {order.orderDate ? (
                              // Log it once to see what the backend is actually sending
                              // console.log("Date from backend:", order.orderDate), 
                              new Date(order.orderDate).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            ) : (
                              <span style={{ color: '#ef4444' }}>Date Missing</span>
                            )}
                          </td>
                          <td><strong>{order.userName || "Guest"}</strong></td>
                          <td style={{ textAlign: 'center' }}>{order.totalQuantity || 0}</td>
                          <td>
                            <div className="item-tags">
                              {order.items?.filter(Boolean).map((item, i) => (
                                <span key={i} className="item-tag">
                                  {item.name} <small style={{ opacity: 0.7 }}>(x{item.qty})</small>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span className={`pill ${order.status?.toUpperCase() || 'PENDING'}`}>
                              {order.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                          No recent orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default AdminManagement;
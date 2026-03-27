import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import BackButton from "../components/BackButton";
import { updateProductStatusAPI } from "../services/adminService";
import { getProducts } from "../services/productService";
import { getAddProductPathForRole, getAdminDashboardPath, getEditProductPathForRole } from "../utils/roleAccess";
import "../styles/AdminManagement.css";

function AdminCatalog() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCarbon, setEditingCarbon] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setLoadError(err.message || "Unable to load admin catalog data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = useMemo(() =>
    products.filter((product) =>
      (product.name || product.productName || "").toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [products, searchTerm]
  );

  const handleUpdate = async (product, isApproved, carbon = null) => {
    try {
      const payload = {
        id: product.id,
        status: isApproved ? "Approved" : "Hold",
        isEcoFriendly: carbon !== null ? carbon.isEcoFriendly : product.isEcoFriendly,
        manufacturing: carbon?.manufacturing ?? product.carbonData?.breakdown?.manufacturing ?? 0,
        packaging: carbon?.packaging ?? product.carbonData?.breakdown?.packaging ?? 0,
        transport: carbon?.transport ?? product.carbonData?.breakdown?.transport ?? 0,
        handling: carbon?.handling ?? product.carbonData?.breakdown?.handling ?? 0,
      };

      const updated = await updateProductStatusAPI(product.id, payload);
      setProducts((prev) => prev.map((item) => item.id === updated.id ? updated : item));
      setEditingCarbon(null);
    } catch (err) {
      alert(err.message || "Update failed.");
    }
  };

  if (loading) return <div className="admin-loading">Connecting to Secure Server...</div>;

  return (
    <>
      <MainNavbar />
      <div className="admin-page">
        {loadError && <div className="admin-load-error" role="alert">{loadError}</div>}

        <header className="admin-hero">
          <BackButton fallbackTo={getAdminDashboardPath()} label="Back" className="admin-back-button" />
          <div>
            <p className="admin-kicker">Catalog Governance</p>
            <h1>Product Moderation & Eco Verification Control</h1>
          </div>
          <button className="solid-btn1" onClick={() => navigate(getAddProductPathForRole("ADMIN"))}>
            + Add Product
          </button>
        </header>

        <input
          className="admin-search"
          placeholder="Search products for moderation..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <section className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3>Inventory Verification</h3>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>{filteredProducts.length} Items in Catalog</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Product Title</th>
                  <th>Current Status</th>
                  <th>Eco-Tag</th>
                  <th style={{ textAlign: "right" }}>Management Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td style={{ fontWeight: "600" }}>{product.name || product.productName}</td>
                      <td><span className={`pill ${product.status === "Approved" ? "verified" : "pending"}`}>{product.status || "Hold"}</span></td>
                      <td>{product.isEcoFriendly ? "Active" : "NO"}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="ad-actions">
                          <button className="ghost-btn approve-btn" onClick={() => handleUpdate(product, true)}>Approve</button>
                          <button className="ghost-btn danger hold-btn" onClick={() => handleUpdate(product, false)}>Hold</button>
                          <button className="ghost-btn" onClick={() => navigate(getEditProductPathForRole("ADMIN", product.id))}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3>LCA Emissions & Verification Control</h3>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Managing {filteredProducts.length} Data Points</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Mfg</th>
                  <th>Pkg</th>
                  <th>Trp</th>
                  <th>Eco-Friendly</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td style={{ fontWeight: "600" }}>{product.name || product.productName}</td>
                    {editingCarbon?.id === product.id ? (
                      <>
                        <td><input type="number" className="table-input" value={editingCarbon.manufacturing} onChange={(e) => setEditingCarbon({ ...editingCarbon, manufacturing: e.target.value })} /></td>
                        <td><input type="number" className="table-input" value={editingCarbon.packaging} onChange={(e) => setEditingCarbon({ ...editingCarbon, packaging: e.target.value })} /></td>
                        <td><input type="number" className="table-input" value={editingCarbon.transport} onChange={(e) => setEditingCarbon({ ...editingCarbon, transport: e.target.value })} /></td>
                        <td><input type="checkbox" checked={editingCarbon.isEcoFriendly} onChange={(e) => setEditingCarbon({ ...editingCarbon, isEcoFriendly: e.target.checked })} /></td>
                        <td style={{ textAlign: "right" }}>
                          <div className="adm-actions">
                            <button className="solid-btn" style={{ padding: "6px 15px", fontSize: "12px" }} onClick={() => handleUpdate(product, product.status === "Approved", editingCarbon)}>Apply</button>
                            <button className="ghost-btn" style={{ padding: "6px 15px", fontSize: "12px" }} onClick={() => setEditingCarbon(null)}>Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{product.carbonData?.breakdown?.manufacturing || 0}</td>
                        <td>{product.carbonData?.breakdown?.packaging || 0}</td>
                        <td>{product.carbonData?.breakdown?.transport || 0}</td>
                        <td>{product.isEcoFriendly ? "✅" : "❌"}</td>
                        <td style={{ textAlign: "right" }}>
                          <div className="a-actions">
                            <button
                              className="ghost-btn"
                              onClick={() => setEditingCarbon({
                                id: product.id,
                                manufacturing: product.carbonData?.breakdown?.manufacturing || 0,
                                packaging: product.carbonData?.breakdown?.packaging || 0,
                                transport: product.carbonData?.breakdown?.transport || 0,
                                isEcoFriendly: product.isEcoFriendly || false,
                              })}
                            >
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
      </div>
    </>
  );
}

export default AdminCatalog;

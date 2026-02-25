import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { logout, getStoredUser } from "../services/authService";
import "../styles/Dashboard.css";

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const user = getStoredUser();
  const { totalItems } = useCart();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    onLogout();
    navigate("/login");
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <h2>EcoBazar</h2>
          <span className={`role-badge ${user?.role === "ADMIN" ? "admin" : "user"}`}>
            {user?.role || "USER"}
          </span>
        </div>

        <div className="navbar-right">
          <div className="profile-wrapper">
            <div
              className="profile-icon"
              aria-label="Open profile menu"
              onClick={() => setShowProfile(!showProfile)}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            {showProfile && (
              <div className="profile-dropdown">
                <p><strong>Name:</strong> {user?.name || "-"}</p>
                <p><strong>Email:</strong> {user?.email || "-"}</p>
                <p><strong>Phone:</strong> {user?.phone || "-"}</p>
                <p><strong>Role:</strong> {user?.role || "USER"}</p>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Dashboard Content with Background Image Link */}
      <div className="dashboard-container">
        <a 
          href="https://ecobazar-ecommerce.vercel.app/_next/image?url=%2Fimages%2FBannar.png&w=3840&q=75" 
          target="_blank" 
          rel="noopener noreferrer"
          className="background-link"
        >
          <div className="background-image"></div>
        </a>
        <div className="content-overlay">
          <p className="hero-kicker">Commerce Control Center</p>
          <h2>Welcome to EcoBazar, {user?.name || "User"}.</h2>
          <p>
            Manage products, track sustainability signals, and continue to Smart Cart with
            live emissions visibility.
          </p>
          {/* <div className="quick-stats">
            <div>
              <span>Current Role</span>
              <strong>{user?.role || "USER"}</strong>
            </div>
            <div>
              <span>Cart Items</span>
              <strong>{totalItems}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>Active</strong>
            </div>
          </div> */}
          <div className="dashboard-actions">
            <button
              className="open-catalog-btn"
              onClick={() => navigate("/products")}
            >
              Open Product Catalog
            </button>
            <button
              className="open-catalog-btn secondary"
              onClick={() => navigate("/cart")}
            >
              Smart Cart ({totalItems})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;

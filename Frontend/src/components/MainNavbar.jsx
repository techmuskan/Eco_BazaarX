import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { logout, getStoredUser } from "../services/authService";
import {
  getAddProductPathForRole,
  getAdminCatalogPath,
  getAdminDashboardPath,
  getAdminManagementPath,
  getCartPathForRole,
  getCatalogPathForRole,
  getCheckoutPathForRole,
  getDashboardPathForRole,
  getInsightsPathForRole,
  getOrdersPathForRole,
  getSellerOrdersPath,
  getSellerProductsPath,
  getSellerProfilePath,
  getWishlistPathForRole,
} from "../utils/roleAccess";

import "../styles/MainNavbar.css";

function MainNavbar({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { items = [] } = useCart();
  const user = getStoredUser();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const homePath = getDashboardPathForRole(user?.role);
  const catalogPath = getCatalogPathForRole(user?.role);
  const isAdmin = user?.role === "ADMIN";
  const isSeller = user?.role === "SELLER";
  const showShopperActions = !isAdmin && !isSeller;

  const isActive = (path) => location.pathname === path;

 const handleLogout = () => {
  logout(); // ✅ always clear token

  if (onLogout) {
    onLogout(); // update App state
  }

  navigate("/login");
   window.location.reload(); 
};

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => setShowProfileDetails(false), 300);
  };

  return (
    <>
      <nav className="main-nav">
        <div className="main-nav-shell">
          <Link to={homePath} className="brand">EcoBazaarX</Link>

          <div className="main-nav-links">
            {isAdmin && (
              <>
                <Link className={isActive(getAdminDashboardPath()) ? "active" : ""} to={getAdminDashboardPath()}>Overview</Link>
                <Link className={isActive(getAdminManagementPath()) ? "active" : ""} to={getAdminManagementPath()}>Management</Link>
                <Link className={isActive(getAdminCatalogPath()) ? "active" : ""} to={getAdminCatalogPath()}>Catalog</Link>
              </>
            )}
            {!isAdmin && (
              <>
                <Link className={isActive(homePath) ? "active" : ""} to={homePath}>
                  {isSeller ? "Seller Hub" : "Home"}
                </Link>
                <Link className={isActive(catalogPath) ? "active" : ""} to={catalogPath}>Catalog</Link>
              </>
            )}
            {!isAdmin && !isSeller && <Link className={isActive(getInsightsPathForRole()) ? "active" : ""} to={getInsightsPathForRole()}>Insights</Link>}
            {isSeller && (
              <Link className={isActive(getAddProductPathForRole(user?.role)) ? "active" : ""} to={getAddProductPathForRole(user?.role)}>List Product</Link>
            )}
            {showShopperActions && (
            <Link className={isActive(getCartPathForRole()) ? "active" : ""} to={getCartPathForRole()}>
              <div className="cart-link-content">
                <i className="fa-solid fa-cart-shopping"></i>
                <span>Cart</span>
                <span className="cart-badge">{items.length}</span>
              </div>
            </Link>
            )}
          </div>

          <div className="navbar-right">
            <div className="profile-icon" onClick={() => setIsSidebarOpen(true)}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </div>
      </nav>

      {/* Side Sidebar Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      {/* Side Sidebar */}
      <div className={`side-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>{showProfileDetails ? "User Profile" : "Account Settings"}</h3>
          <button className="close-btn" onClick={closeSidebar}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="sidebar-content">
          {!showProfileDetails ? (
            /* --- VIEW 1: MAIN NAVIGATION --- */
            <div className="menu-view fade-in">
              <button className="sidebar-link" onClick={() => setShowProfileDetails(true)}>
                <span className="icon"><i className="fa-solid fa-user-gear"></i></span> My Profile
              </button>

              {showShopperActions && <Link to={getOrdersPathForRole()} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-box-archive"></i></span> My Orders
              </Link>}

              {showShopperActions && <Link to={getCheckoutPathForRole()} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-location-dot"></i></span> Manage Addresses
              </Link>}

              {showShopperActions && <Link to={getWishlistPathForRole()} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-heart"></i></span> Wishlist
              </Link>}

              {isSeller && <Link to={getDashboardPathForRole(user?.role)} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-store"></i></span> Seller Hub
              </Link>}

              {isSeller && <Link to={getSellerProductsPath()} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-boxes-stacked"></i></span> Seller Products
              </Link>}

              {isSeller && <Link to={getSellerOrdersPath()} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-receipt"></i></span> Seller Orders
              </Link>}

              {isSeller && <Link to={getSellerProfilePath()} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-id-card"></i></span> Store Profile
              </Link>}

              {isSeller && <Link to={getAddProductPathForRole(user?.role)} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-square-plus"></i></span> Add Product
              </Link>}

              {isAdmin && <Link to={getAdminDashboardPath()} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-chart-line"></i></span> Admin Dashboard
              </Link>}

              {isAdmin && <Link to={getAdminManagementPath()} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-shield"></i></span> Admin Governance
              </Link>}

              {isAdmin && <Link to={getAdminCatalogPath()} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-boxes-stacked"></i></span> Admin Catalog
              </Link>}

              <div className="sidebar-divider" />

              <button className="sidebar-link logout-link" onClick={handleLogout}>
                <span className="icon"><i className="fa-solid fa-right-from-bracket"></i></span> Logout
              </button>
            </div>
          ) : (
            /* --- VIEW 2: PROFILE DETAILS --- */
            <div className="profile-view fade-in">
              {/* 🆕 Improved Back Link with FontAwesome Arrow */}
              <button className="sidebar-link back-link" onClick={() => setShowProfileDetails(false)}>
                <span className="icon"><i className="fa-solid fa-chevron-left"></i></span> Back
              </button>

              <div className="sidebar-user-info">
                <div className="user-avatar-large">
                  {user?.image ? (
                    <img src={user.image} alt={user.name} />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                  )}
                </div>
                <div className="user-details-group">
                  <h4 className="user-name-title">{user?.name || "Eco User"}</h4>
                  <p className="user-email-text">{user?.email || "No email available"}</p>
                  <span className="user-role-badge">{user?.role || "USER"}</span>
                </div>
              </div>

              <div className="sidebar-divider" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MainNavbar;

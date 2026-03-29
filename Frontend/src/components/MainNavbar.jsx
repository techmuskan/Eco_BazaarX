import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { logout, getStoredUser } from "../services/authService";
import {
  getAddProductPathForRole,
  getAccountPathForRole,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const homePath = getDashboardPathForRole(user?.role);
  const catalogPath = getCatalogPathForRole(user?.role);
  const accountPath = getAccountPathForRole(user?.role);
  const isAdmin = user?.role === "ADMIN";
  const isSeller = user?.role === "SELLER";
  const showShopperActions = !isAdmin && !isSeller;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    closeSidebar();
    setIsMobileMenuOpen(false);

    if (onLogout) {
      onLogout();
      return;
    }

    navigate("/login", { replace: true });
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="main-nav">
        <div className="main-nav-shell">
          <Link to={homePath} className="brand">EcoBazaarX</Link>

          <button
            type="button"
            className="mobile-menu-btn"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`main-nav-links ${isMobileMenuOpen ? "open" : ""}`}>
            {isAdmin && (
              <>
                <Link className={isActive(getAdminDashboardPath()) ? "active" : ""} to={getAdminDashboardPath()} onClick={closeMobileMenu}>Overview</Link>
                <Link className={isActive(getAdminManagementPath()) ? "active" : ""} to={getAdminManagementPath()} onClick={closeMobileMenu}>Management</Link>
                <Link className={isActive(getAdminCatalogPath()) ? "active" : ""} to={getAdminCatalogPath()} onClick={closeMobileMenu}>Catalog</Link>
              </>
            )}
            {!isAdmin && (
              <>
                <Link className={isActive(homePath) ? "active" : ""} to={homePath} onClick={closeMobileMenu}>
                  {isSeller ? "Seller Hub" : "Home"}
                </Link>
                <Link className={isActive(catalogPath) ? "active" : ""} to={catalogPath} onClick={closeMobileMenu}>Catalog</Link>
              </>
            )}
            {!isAdmin && !isSeller && <Link className={isActive(getInsightsPathForRole()) ? "active" : ""} to={getInsightsPathForRole()} onClick={closeMobileMenu}>Insights</Link>}
            {isSeller && (
              <Link className={isActive(getAddProductPathForRole(user?.role)) ? "active" : ""} to={getAddProductPathForRole(user?.role)} onClick={closeMobileMenu}>List Product</Link>
            )}
            {showShopperActions && (
            <Link className={isActive(getCartPathForRole()) ? "active" : ""} to={getCartPathForRole()} onClick={closeMobileMenu}>
              <div className="cart-link-content">
                <i className="fa-solid fa-cart-shopping"></i>
                <span>Cart</span>
                <span className="cart-badge">{items.length}</span>
              </div>
            </Link>
            )}
          </div>

          <div className="navbar-right">
            <div className="profile-icon" onClick={() => { setIsSidebarOpen(true); closeMobileMenu(); }}>
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
          <h3>Account Settings</h3>
          <button className="close-btn" onClick={closeSidebar}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="sidebar-content">
          <div className="menu-view fade-in">
              <Link to={accountPath} className="sidebar-link" onClick={closeSidebar}>
                <span className="icon"><i className="fa-solid fa-user-gear"></i></span> My Profile
              </Link>

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
        </div>
      </div>
    </>
  );
}

export default MainNavbar;

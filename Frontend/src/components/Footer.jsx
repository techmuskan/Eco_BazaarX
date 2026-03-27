import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
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
  getWishlistPathForRole,
} from "../utils/roleAccess";
import "../styles/Footer.css";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = ({ user }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const dashboardPath = getDashboardPathForRole(user?.role);
  const catalogPath = getCatalogPathForRole(user?.role);
  const isAdmin = user?.role === "ADMIN";
  const isSeller = user?.role === "SELLER";

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter your email", "error");
      return;
    }
    
    setSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      showToast("Successfully subscribed to newsletter!", "success");
      setEmail("");
      setSubscribing(false);
    }, 1000);
  };

  return (
    <footer className="modern-footer">
      <div className="footer-container">

        {/* Brand + Info */}
        <div className="footer-brand">
          <p className="footer-title">EcoBazaarX</p>
          <span className="footer-subtitle">
            Smarter shopping with sustainability visibility.
          </span>

          {/* Social Icons */}
          <div className="footer-social">
            <a href="https://www.facebook.com/EcoBazaarX" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com/EcoBazaarX" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter">
              <FaTwitter />
            </a>
            <a href="https://www.instagram.com/EcoBazaarX" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
              <FaInstagram />
            </a>
            <a href="https://www.linkedin.com/company/EcoBazaarX" target="_blank" rel="noopener noreferrer" aria-label="Connect with us on LinkedIn">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        {/* Links section */}
        <div className="footer-links">
          <h4>Marketplace</h4>
          <Link to={catalogPath}>Products</Link>
          {user && !isAdmin && !isSeller && <Link to={getCartPathForRole()}>Cart</Link>}
          {user && !isAdmin && !isSeller && <Link to={getWishlistPathForRole()}>Wishlist</Link>}
          {user && !isAdmin && !isSeller && <Link to={getCheckoutPathForRole()}>Checkout</Link>}
          {isSeller && <Link to={getAddProductPathForRole(user?.role)}>List Product</Link>}
        </div>

        <div className="footer-links">
          <h4>Account</h4>
          {user ? (
            <>
              <Link to={dashboardPath}>Dashboard</Link>
              {!isAdmin && !isSeller && <Link to={getOrdersPathForRole()}>My Orders</Link>}
              {!isAdmin && !isSeller && <Link to={getInsightsPathForRole()}>Carbon Insights</Link>}
              {isSeller && <Link to={getDashboardPathForRole(user?.role)}>Seller Hub</Link>}
              {user.role === "ADMIN" && <Link to={getAdminDashboardPath()}>Admin Dashboard</Link>}
              {user.role === "ADMIN" && <Link to={getAdminManagementPath()}>Admin Management</Link>}
              {user.role === "ADMIN" && <Link to={getAdminCatalogPath()}>Admin Catalog</Link>}
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <h4>Join our newsletter</h4>
          <p>Get updates about eco products & offers</p>
          <form className="newsletter-box" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribing}
            />
            <button type="submit" disabled={subscribing}>
              {subscribing ? "..." : "Subscribe"}
            </button>
          </form>
        </div>

      </div>

      {/* Bottom line */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} EcoBazaarX. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/MainNavbar.css";

function MainNavbar() {
  const location = useLocation();
  const { totalItems } = useCart();

  const isActive = path => location.pathname === path;

  return (
    <nav className="main-nav">
      <div className="main-nav-shell">
        <Link to="/dashboard" className="brand">
          EcoBazaarX
        </Link>
        <div className="main-nav-links">
          <Link className={isActive("/dashboard") ? "active" : ""} to="/dashboard">
            Home
          </Link>
          <Link className={isActive("/products") ? "active" : ""} to="/products">
            Catalog
          </Link>
          <Link className={isActive("/cart") ? "active" : ""} to="/cart">
            Cart ({totalItems})
          </Link>
          <Link className={isActive("/checkout") ? "active" : ""} to="/checkout">
            Checkout
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default MainNavbar;

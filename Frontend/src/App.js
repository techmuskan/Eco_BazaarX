import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ProductCatalog from "./pages/ProductCatalog";
import AddProduct from "./pages/AddProduct";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import WishlistPage from "./pages/WishlistPage";
import CarbonInsights from "./pages/CarbonInsights";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManagement from "./pages/AdminManagement";
import AdminCatalog from "./pages/AdminCatalog";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import SellerOrders from "./pages/SellerOrders";
import SellerProfile from "./pages/SellerProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";

import { isAuthenticated, getStoredUser, logout } from "./services/authService";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";
import {
  getAddProductPathForRole,
  getCatalogPathForRole,
  getCheckoutPathForRole,
  getDashboardPathForRole,
  getInsightsPathForRole,
  getOrdersPathForRole,
  getCartPathForRole,
  getWishlistPathForRole,
} from "./utils/roleAccess";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const storedUser = getStoredUser();
        setUser(storedUser);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => setUser(userData);
  const handleSignupSuccess = (userData) => setUser(userData);
  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (loading) return <div className="loader">Initializing app...</div>;

  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
            {/* --- Public Routes --- */}
            <Route
              path="/login"
              element={user ? <Navigate to={getDashboardPathForRole(user.role)} replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/signup"
              element={user ? <Navigate to={getDashboardPathForRole(user.role)} replace /> : <Signup onSignupSuccess={handleSignupSuccess} />}
            />
            <Route
              path="/forgot-password"
              element={user ? <Navigate to={getDashboardPathForRole(user.role)} replace /> : <ForgotPassword />}
            />

            {/* --- Role Home Redirect --- */}
            <Route
              path="/"
              element={user ? <Navigate to={getDashboardPathForRole(user.role)} replace /> : <LandingPage />}
            />
            <Route
              path="/dashboard"
              element={user ? <Navigate to={getDashboardPathForRole(user.role)} replace /> : <Navigate to="/login" replace />}
            />

            {/* --- Role Dashboards --- */}
            <Route
              path="/user/dashboard"
              element={<ProtectedRoute user={user} allowedRoles={["USER"]}><Dashboard user={user} onLogout={handleLogout} /></ProtectedRoute>}
            />
            <Route
              path="/seller/dashboard"
              element={<ProtectedRoute user={user} allowedRoles={["SELLER"]}><SellerDashboard onLogout={handleLogout} /></ProtectedRoute>}
            />
            <Route
              path="/seller/products"
              element={<ProtectedRoute user={user} allowedRoles={["SELLER"]}><SellerProducts onLogout={handleLogout} /></ProtectedRoute>}
            />
            <Route
              path="/seller/orders"
              element={<ProtectedRoute user={user} allowedRoles={["SELLER"]}><SellerOrders onLogout={handleLogout} /></ProtectedRoute>}
            />
            <Route
              path="/seller/profile"
              element={<ProtectedRoute user={user} allowedRoles={["SELLER"]}><SellerProfile onLogout={handleLogout} /></ProtectedRoute>}
            />
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute user={user} allowedRoles={["ADMIN"]}><AdminDashboard user={user} /></ProtectedRoute>}
            />

            {/* --- Role Catalogs --- */}
            <Route path="/user/catalog" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><ProductCatalog user={user} /></ProtectedRoute>} />
            <Route path="/seller/catalog" element={<ProtectedRoute user={user} allowedRoles={["SELLER"]}><ProductCatalog user={user} /></ProtectedRoute>} />
            <Route path="/admin/catalog" element={<ProtectedRoute user={user} allowedRoles={["ADMIN"]}><AdminCatalog user={user} /></ProtectedRoute>} />

            {/* --- Shared Product Detail --- */}
            <Route path="/catalog/:id" element={<ProtectedRoute user={user}><ProductDetail /></ProtectedRoute>} />
            <Route
              path="/products/:id"
              element={<ProtectedRoute user={user}><LegacyProductDetailRedirect /></ProtectedRoute>}
            />
            <Route
              path="/product/:id"
              element={<ProtectedRoute user={user}><LegacyProductDetailRedirect /></ProtectedRoute>}
            />

            {/* --- Seller/Admin Product Management --- */}
            <Route path="/seller/products/new" element={<ProtectedRoute user={user} allowedRoles={["SELLER"]}><AddProduct /></ProtectedRoute>} />
            <Route path="/seller/products/:id/edit" element={<ProtectedRoute user={user} allowedRoles={["SELLER"]}><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/products/new" element={<ProtectedRoute user={user} allowedRoles={["ADMIN"]}><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/products/:id/edit" element={<ProtectedRoute user={user} allowedRoles={["ADMIN"]}><AddProduct /></ProtectedRoute>} />
            <Route
              path="/add-product"
              element={
                <ProtectedRoute user={user} allowedRoles={["SELLER", "ADMIN"]}>
                  <Navigate to={getAddProductPathForRole(user?.role)} replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-product/:id"
              element={
                <ProtectedRoute user={user} allowedRoles={["SELLER", "ADMIN"]}>
                  <LegacyEditProductRedirect user={user} />
                </ProtectedRoute>
              }
            />

            {/* --- User Shopping & Checkout Flow --- */}
            <Route path="/user/cart" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><CartPage /></ProtectedRoute>} />
            <Route path="/user/checkout" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><CheckoutPage /></ProtectedRoute>} />
            <Route path="/user/payment" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><PaymentPage /></ProtectedRoute>} />
            <Route path="/user/order-success" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><OrderSuccess /></ProtectedRoute>} />
            <Route path="/user/orders" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><MyOrders /></ProtectedRoute>} />
            <Route path="/user/wishlist" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><WishlistPage /></ProtectedRoute>} />
            <Route path="/user/insights" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><CarbonInsights user={user} /></ProtectedRoute>} />

            {/* --- Admin Views --- */}
            <Route path="/admin/management" element={<ProtectedRoute user={user} allowedRoles={["ADMIN"]}><AdminManagement user={user} /></ProtectedRoute>} />

            {/* --- Backward-compatible aliases --- */}
            <Route path="/products" element={<ProtectedRoute user={user}><Navigate to={getCatalogPathForRole(user?.role)} replace /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><Navigate to={getCartPathForRole()} replace /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><Navigate to={getCheckoutPathForRole()} replace /></ProtectedRoute>} />
            <Route path="/payment-process" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><PaymentPage /></ProtectedRoute>} />
            <Route path="/order-success" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><OrderSuccess /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><Navigate to={getOrdersPathForRole()} replace /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><Navigate to={getWishlistPathForRole()} replace /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute user={user} allowedRoles={["USER"]}><Navigate to={getInsightsPathForRole()} replace /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute user={user} allowedRoles={["ADMIN"]}><Navigate to={getDashboardPathForRole("ADMIN")} replace /></ProtectedRoute>} />

            {/* --- Default Redirect --- */}
            <Route path="*" element={<Navigate to={user ? getDashboardPathForRole(user.role) : "/login"} replace />} />
            </Routes>
            <Footer user={user} />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}

function LegacyProductDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={`/catalog/${id}`} replace />;
}

function LegacyEditProductRedirect({ user }) {
  const { id } = useParams();
  const destination = user?.role === "ADMIN"
    ? `/admin/products/${id}/edit`
    : `/seller/products/${id}/edit`;

  return <Navigate to={destination} replace />;
}

export default App;

import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import ForgotPassword from "./components/ForgotPassword";
import ProductCatalog from "./components/ProductCatalog";
import ProductDetail from "./components/ProductDetail";

import { isAuthenticated, getStoredUser } from "./services/authService";

function App() {
  const [user, setUser] = useState(null);

  // Check login on app load
  useEffect(() => {
    if (isAuthenticated()) {
      const storedUser = getStoredUser();
      setUser(storedUser);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login
                goToSignup={() => {}}
                onLoginSuccess={handleLoginSuccess}
              />
            )
          }
        />

        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Signup
                goToLogin={() => {}}
                onSignupSuccess={handleSignupSuccess}
              />
            )
          }
        />

        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />}
        />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/products"
          element={user ? <ProductCatalog /> : <Navigate to="/login" />}
        />

        <Route
          path="/products/:productId"
          element={user ? <ProductDetail /> : <Navigate to="/login" />}
        />

        {/* Default Route */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

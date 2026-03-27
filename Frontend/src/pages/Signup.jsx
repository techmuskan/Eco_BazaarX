import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signup } from "../services/authService";
import { getDashboardPathForRole } from "../utils/roleAccess";
import "../styles/Signup.css";

function Signup({ onSignupSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestedRole = String(searchParams.get("role") || "USER").toUpperCase();
    if (requestedRole === "USER" || requestedRole === "SELLER") {
      setFormData((current) => ({ ...current, role: requestedRole }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !phone || !password) {
      setError("Please fill in all required fields");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Phone number must be 10 digits");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      userData.role = String(userData.role || "USER").toUpperCase();
      const { user } = await signup(userData);
      onSignupSuccess(user);
      navigate(getDashboardPathForRole(user.role));
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-theme">
      <div className="auth-shell">
        <aside className="auth-showcase">
          <p className="auth-kicker">Join EcoBazaarX</p>
          <h1>Build your low-impact shopping profile.</h1>
          <p>
            Create an account to track smarter purchase choices with estimated carbon impact
            at every step.
          </p>
          <div className="showcase-points">
            <span>Eco ratings on products</span>
            <span>Greener swaps before checkout</span>
            <span>Role-based onboarding</span>
          </div>
        </aside>

        <div className="auth-card">
          <h2>Sign Up</h2>
          <p className="auth-sub">Choose whether you are joining as a shopper or a seller.</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="USER">Shopper Account</option>
              <option value="SELLER">Seller Account</option>
            </select>


            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p>
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>

          <p className="auth-mini-help">Admin access is managed separately by the platform.</p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

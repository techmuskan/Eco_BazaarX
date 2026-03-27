import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import BackButton from "../components/BackButton";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const passwordStrength = getPasswordStrength(formData.password);

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
          <BackButton fallbackTo="/" label="Back to Home" className="auth-back-button" forceFallback />
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

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
              </button>
            </div>

            <div className="password-strength">
              <div className="strength-track">
                <span
                  className={`strength-fill strength-${passwordStrength.tone}`}
                  style={{ width: `${passwordStrength.score}%` }}
                />
              </div>
              <p>{passwordStrength.label}</p>
            </div>

            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
              </button>
            </div>

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

function getPasswordStrength(password) {
  if (!password) {
    return { score: 0, label: "Password strength will appear here", tone: "idle" };
  }

  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 10) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  if (score < 40) return { score, label: "Weak password", tone: "weak" };
  if (score < 75) return { score, label: "Medium password", tone: "medium" };

  return { score: 100, label: "Strong password", tone: "strong" };
}

export default Signup;

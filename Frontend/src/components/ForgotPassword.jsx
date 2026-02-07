import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: email, 2: OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/user/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.text();

      if (data === "User not found") {
        setError(data);
      } else {
        setMessage(data);
        setStep(2);
      }
    } catch {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/user/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.text();

      if (data === "Password reset successfully") {
        setMessage(data);

        // Redirect to login after short delay
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(data);
      }
    } catch {
      setError("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Forgot Password</h2>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="back-link" onClick={() => navigate("/login")}>
          Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

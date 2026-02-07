import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getStoredUser } from "../services/authService";
import "../styles/Dashboard.css";

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    onLogout();
    navigate("/login"); // ✅ redirect after logout
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <h2>EcoBazar</h2>
        </div>

        <div className="navbar-right">
          <div className="profile-wrapper">
            <div
              className="profile-icon"
              onClick={() => setShowProfile(!showProfile)}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            {showProfile && (
              <div className="profile-dropdown">
                <p><strong>Name:</strong> {user?.name || "-"}</p>
                <p><strong>Email:</strong> {user?.email || "-"}</p>
                <p><strong>Phone:</strong> {user?.phone || "-"}</p>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-container">
        <h2>Hello 👋</h2>
      </div>
    </>
  );
}

export default Dashboard;

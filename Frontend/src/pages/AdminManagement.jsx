import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import {
  changeUserRole,
  fetchAdminUsers,
  fetchSellerProfiles,
  updateSellerApproval,
} from "../services/adminService";
import { getAdminCatalogPath, getAdminDashboardPath } from "../utils/roleAccess";
import "../styles/AdminManagement.css";

function AdminManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [sellerProfiles, setSellerProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [usersResult, sellerProfilesResult] = await Promise.allSettled([
          fetchAdminUsers(),
          fetchSellerProfiles(),
        ]);

        setUsers(usersResult.status === "fulfilled" ? (usersResult.value || []) : []);
        setSellerProfiles(sellerProfilesResult.status === "fulfilled" ? (sellerProfilesResult.value || []) : []);

        const firstFailure = [usersResult, sellerProfilesResult]
          .filter((result) => result.status === "rejected")
          .map((result) => result.reason?.message)
          .find(Boolean);

        if (firstFailure) {
          setLoadError(firstFailure);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredUsers = useMemo(() =>
    users.filter((user) =>
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [users, searchTerm]
  );

  const filteredSellerProfiles = useMemo(() =>
    sellerProfiles.filter((profile) =>
      (profile.storeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.sellerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.contactEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [sellerProfiles, searchTerm]
  );

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedUser = await changeUserRole(userId, newRole);
      setUsers((prev) => prev.map((user) => user.id === userId ? { ...user, ...updatedUser } : user));
      const refreshedSellerProfiles = await fetchSellerProfiles();
      setSellerProfiles(Array.isArray(refreshedSellerProfiles) ? refreshedSellerProfiles : []);
    } catch (err) {
      alert(err.message || "Role change failed.");
    }
  };

  const handleSellerApproval = async (profileId, approved) => {
    try {
      const updated = await updateSellerApproval(profileId, approved);
      setSellerProfiles((prev) => prev.map((profile) => profile.id === profileId ? updated : profile));
    } catch (err) {
      alert(err.message || "Seller approval update failed.");
    }
  };

  if (loading) return <div className="admin-loading">Connecting to Secure Server...</div>;

  return (
    <>
      <MainNavbar />
      <div className="admin-page">
        {loadError && <div className="admin-load-error" role="alert">{loadError}</div>}

        <header className="admin-hero">
          <div>
            <p className="admin-kicker">Access & Governance</p>
            <h1>User Roles, Seller Approval, and Platform Control</h1>
          </div>
          <div className="admin-actions">
            <button className="solid-btn" onClick={() => navigate(getAdminDashboardPath())}>
              Back to Dashboard
            </button>
            <button className="solid-btn1" onClick={() => navigate(getAdminCatalogPath())}>
              Open Catalog Review
            </button>
          </div>
        </header>

        <input
          className="admin-search"
          placeholder="Search users, stores, or seller contacts..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <section className="admin-card">
          <h3>Identity & Access Management</h3>
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td><span className={`pill ${user.role}`}>{user.role}</span></td>
                  <td>
                    <select className="role-select" value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                      <option value="USER">USER</option>
                      <option value="SELLER">SELLER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-card">
          <h3>Seller Approval Queue</h3>
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Seller</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellerProfiles.length > 0 ? (
                filteredSellerProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td><strong>{profile.storeName}</strong></td>
                    <td>{profile.sellerName}</td>
                    <td>{profile.contactEmail}</td>
                    <td>
                      <span className={`pill ${profile.approved ? "verified" : "pending"}`}>
                        {profile.approved ? "APPROVED" : "PENDING"}
                      </span>
                    </td>
                    <td>
                      <div className="ad-actions">
                        <button className="ghost-btn approve-btn" onClick={() => handleSellerApproval(profile.id, true)}>
                          Approve
                        </button>
                        <button className="ghost-btn danger hold-btn" onClick={() => handleSellerApproval(profile.id, false)}>
                          Hold
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No seller profiles found for the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

export default AdminManagement;

import { useEffect, useState } from "react";
import MainNavbar from "../components/MainNavbar";
import { getStoredUser, setStoredUser } from "../services/authService";
import { fetchSellerProfile, updateSellerProfile } from "../services/sellerService";
import "../styles/SellerDashboard.css";

function SellerProfile({ onLogout }) {
  const user = getStoredUser();
  const [profileForm, setProfileForm] = useState({
    storeName: "",
    storeDescription: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchSellerProfile();
        setProfileForm({
          storeName: profile?.storeName || "",
          storeDescription: profile?.storeDescription || "",
          contactEmail: profile?.contactEmail || "",
          contactPhone: profile?.contactPhone || "",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const updatedProfile = await updateSellerProfile(profileForm);
      if (user) {
        setStoredUser({
          ...user,
          storeName: updatedProfile.storeName,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <MainNavbar onLogout={onLogout} />
      <div className="seller-dashboard">
        <section className="seller-hero">
          <div>
            <p className="seller-kicker">Store Profile</p>
            <h1>Define how your storefront appears across the platform.</h1>
            <p>Keep your store name, description, and contact details aligned for buyers and admins.</p>
          </div>
        </section>

        <section className="seller-panel">
          <h2>Store identity</h2>
          {loading ? (
            <p className="seller-empty">Loading store profile...</p>
          ) : (
            <form className="seller-form-grid" onSubmit={handleSubmit}>
              <label>
                <span>Store name</span>
                <input type="text" name="storeName" value={profileForm.storeName} onChange={handleChange} />
              </label>
              <label className="seller-form-full">
                <span>Store description</span>
                <textarea name="storeDescription" rows="4" value={profileForm.storeDescription} onChange={handleChange} />
              </label>
              <label>
                <span>Contact email</span>
                <input type="email" name="contactEmail" value={profileForm.contactEmail} onChange={handleChange} />
              </label>
              <label>
                <span>Contact phone</span>
                <input type="text" name="contactPhone" value={profileForm.contactPhone} onChange={handleChange} />
              </label>
              <button type="submit" className="seller-table-btn seller-form-submit" disabled={saving}>
                {saving ? "Saving..." : "Save Store Profile"}
              </button>
            </form>
          )}
        </section>
      </div>
    </>
  );
}

export default SellerProfile;

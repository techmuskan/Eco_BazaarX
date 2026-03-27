import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import {
  getAccountPathForRole,
  getCatalogPathForRole,
  getDashboardPathForRole,
} from "../utils/roleAccess";
import "../styles/AccountProfile.css";

function AccountProfile({ user }) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "EU";

  return (
    <main className="account-page">
      <section className="account-shell">
        <BackButton fallbackTo={getDashboardPathForRole(user?.role)} label="Back" className="account-back-button" />
        <div className="account-hero">
          <div className="account-avatar">{initials}</div>
          <div className="account-hero-copy">
            <p className="account-kicker">Account profile</p>
            <h1>{user?.name || "EcoBazaarX User"}</h1>
            <p>
              View your core account details and use the quick links below to move
              back into your workspace.
            </p>
          </div>
        </div>

        <div className="account-grid">
          <article className="account-card">
            <h2>Profile details</h2>
            <dl className="account-details">
              <div>
                <dt>Name</dt>
                <dd>{user?.name || "Not available"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user?.email || "Not available"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{user?.phone || "Not available"}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{user?.role || "USER"}</dd>
              </div>
            </dl>
          </article>

          <article className="account-card">
            <h2>Quick access</h2>
            <div className="account-links">
              <Link to={getDashboardPathForRole(user?.role)}>Go to dashboard</Link>
              <Link to={getCatalogPathForRole(user?.role)}>Open catalog</Link>
              <Link to={getAccountPathForRole(user?.role)}>Refresh account page</Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default AccountProfile;

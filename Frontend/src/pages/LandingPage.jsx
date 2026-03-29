import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

const workspaceCards = [
  {
    label: "Buyer Workspace",
    title: "Commerce for modern buyers",
    text: "Product discovery, cart, checkout, orders, wishlist, and insights in one buyer workspace.",
    link: "/signup?role=USER",
    cta: "Start as Buyer",
  },
  {
    label: "Seller Workspace",
    title: "Seller operations without clutter",
    text: "Listings, storefront details, fulfillment progress, and seller orders in one place.",
    link: "/signup?role=SELLER",
    cta: "Start as Seller",
  },
  {
    label: "Admin Workspace",
    title: "Marketplace governance built in",
    text: "Approvals, role changes, moderation, and reporting from one admin layer.",
    link: "/login",
    cta: "Admin Sign In",
  },
];

const proofItems = [
  "Role-based access",
  "Dedicated dashboards",
  "Unified catalog",
];

const capabilityRows = [
  {
    title: "Marketplace infrastructure in one product",
    text: "Buyer experience, seller tooling, and admin operations inside one product.",
  },
  {
    title: "Dedicated workspaces for every role",
    text: "Each role gets its own workspace instead of one overloaded dashboard.",
  },
  {
    title: "Operational workflows, not patchwork tools",
    text: "Approvals, catalog review, and governance are built into the platform.",
  },
];

function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link className="landing-brand" to="/">
          EcoBazaarX
        </Link>

        <nav className="landing-nav" aria-label="Public navigation">
          <a href="#overview">Overview</a>
          <a href="#workspaces">Workspaces</a>
          <a href="#capabilities">Capabilities</a>
        </nav>

        <div className="landing-header-actions">
          <Link className="header-link" to="/login">
            Login
          </Link>
          <Link className="button button-primary button-compact" to="/signup?role=USER">
            Start Free
          </Link>
        </div>
      </header>

      <section className="hero" id="overview">
        <div className="hero-copy">
          <span className="eyebrow">Marketplace SaaS</span>
          <h1>One platform. Every marketplace role.</h1>
          <p>
            EcoBazaarX brings buyers, sellers, and admins into one connected platform with
            dedicated workspaces for each role.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to="/signup?role=USER">
              Create Buyer Account
            </Link>
            <Link className="button button-secondary" to="/signup?role=SELLER">
              Create Seller Account
            </Link>
          </div>

          <div className="hero-proof">
            {proofItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-shell">
            <div className="preview-topbar">
              <span />
              <span />
              <span />
            </div>

            <div className="preview-layout">
              <aside className="preview-sidebar">
                <div className="preview-sidebar-brand">
                  <strong>Control Center</strong>
                  <small>Platform Console</small>
                </div>
                <div className="preview-nav-item active">Overview</div>
                <div className="preview-nav-item">Catalog</div>
                <div className="preview-nav-item">Orders</div>
                <div className="preview-nav-item">Approvals</div>
                <div className="preview-sidebar-foot">
                  <span>Live status</span>
                  <strong>All systems aligned</strong>
                </div>
              </aside>

              <div className="preview-main">
                <div className="preview-main-top">
                  <div>
                    <small>Workspace Snapshot</small>
                    <strong>Marketplace control layer</strong>
                  </div>
                  <span className="preview-badge">Multi-role</span>
                </div>

                <article className="preview-feature-card">
                  <small>Platform View</small>
                  <strong>Role-specific operations, one system</strong>
                  <p>Buyers shop, sellers operate, and admins govern in clearly separated workflows.</p>
                </article>

                <div className="preview-metrics">
                  <article>
                    <strong>3</strong>
                    <span>Hub</span>
                  </article>
                  <article>
                    <strong>1</strong>
                    <span>Platform</span>
                  </article>
                  <article>
                    <strong>Built-in</strong>
                    <span>Control</span>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section workspaces-section" id="workspaces">
        <div className="section-head">
          <span className="eyebrow">Workspaces</span>
          <h2>Every side of the marketplace gets the tools it actually needs.</h2>
          <p>
            Customers, sellers, and admins each get a focused experience on the same business system.
          </p>
        </div>

        <div className="workspace-grid">
          {workspaceCards.map((card) => (
            <article className="workspace-card" key={card.title}>
              <span className="workspace-label">{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <Link className="workspace-link" to={card.link}>
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section capabilities-section" id="capabilities">
        <div className="section-head narrow">
          <span className="eyebrow">Capabilities</span>
          <h2>Designed like marketplace software, not just an online shop.</h2>
        </div>

        <div className="capability-list">
          {capabilityRows.map((item) => (
            <article className="capability-row" key={item.title}>
              <div>
                <h3>{item.title}</h3>
              </div>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div>
          <span className="eyebrow">Get Started</span>
          <h2>Choose your role and step into the marketplace.</h2>
          <p>Start as a buyer, onboard as a seller, or sign in to continue.</p>
        </div>

        <div className="hero-actions">
          <Link className="button button-primary" to="/signup?role=USER">
            Start Free
          </Link>
          <Link className="button button-secondary" to="/login">
            Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;

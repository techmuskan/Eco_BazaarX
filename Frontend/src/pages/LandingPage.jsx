import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

const platformStats = [
  { value: "3 roles", label: "Buyer, seller, and admin workspaces" },
  { value: "1 flow", label: "Unified marketplace with role-aware access" },
  { value: "CO2 aware", label: "Sustainability visibility in commerce journeys" },
];

const roleCards = [
  {
    title: "Buyers",
    text: "Browse products, manage wishlist and cart, checkout cleanly, and review carbon insights after purchase.",
    actionLabel: "Join as buyer",
    actionLink: "/signup?role=USER",
  },
  {
    title: "Sellers",
    text: "Run your store from one workspace with product management, order handling, and seller profile controls.",
    actionLabel: "Start selling",
    actionLink: "/signup?role=SELLER",
  },
  {
    title: "Admins",
    text: "Moderate the catalog, approve sellers, manage roles, and watch marketplace trends from a governance console.",
    actionLabel: "Admin access",
    actionLink: "/login",
  },
];

const featureSteps = [
  {
    title: "Discover products with context",
    text: "Buyers see catalog detail and sustainability signals instead of shopping blind.",
  },
  {
    title: "Operate a real seller workspace",
    text: "Sellers manage their inventory, product submissions, and order pipeline through dedicated routes.",
  },
  {
    title: "Govern the platform centrally",
    text: "Admins handle approvals, moderation, and oversight from a split admin console.",
  },
];

function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-topbar">
        <Link className="landing-brand" to="/">
          EcoBazaarX
        </Link>

        <nav className="landing-topnav" aria-label="Public navigation">
          <a href="#platform">Platform</a>
          <a href="#roles">Roles</a>
          <a href="#workflow">Workflow</a>
        </nav>

        <div className="landing-topbar-actions">
          <Link className="landing-text-link" to="/login">
            Login
          </Link>
          <Link className="landing-button primary compact" to="/signup">
            Get Started
          </Link>
        </div>
      </header>

      <section className="landing-hero" id="platform">
        <div className="landing-copy">
          <span className="landing-kicker">SaaS marketplace foundation</span>
          <h1>Build trust into commerce, not just the checkout button.</h1>
          <p>
            EcoBazaarX is a role-based marketplace where buyers shop with more
            clarity, sellers operate with dedicated tools, and admins govern
            the platform with control over approvals, catalog quality, and
            growth.
          </p>

          <div className="landing-actions">
            <Link className="landing-button primary" to="/signup">
              Create account
            </Link>
            <Link className="landing-button secondary" to="/login">
              Sign in
            </Link>
          </div>

          <div className="landing-badges">
            <span>User dashboard</span>
            <span>Seller workspace</span>
            <span>Admin governance</span>
          </div>
        </div>

        <div className="landing-hero-stack">
          <div className="landing-card spotlight">
            <p className="landing-card-label">Live platform view</p>
            <h2>One storefront, three clear operating modes.</h2>
            <p>
              The platform is structured so each role sees the right routes,
              tools, and decisions without crossing into the wrong workflow.
            </p>
          </div>

          <div className="landing-console-preview" aria-label="Platform preview">
            <article className="console-preview-panel">
              <div className="console-preview-header">
                <span className="console-dot" />
                <span className="console-dot" />
                <span className="console-dot" />
              </div>
              <div className="console-preview-content">
                <div className="console-sidebar">
                  <span>Overview</span>
                  <span>Orders</span>
                  <span>Catalog</span>
                </div>
                <div className="console-main">
                  <div className="console-chart-card">
                    <strong>Platform activity</strong>
                    <div className="console-chart-bars">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                  <div className="console-metric-row">
                    <div>
                      <small>Seller approvals</small>
                      <strong>18 pending</strong>
                    </div>
                    <div>
                      <small>Eco-reviewed SKUs</small>
                      <strong>264</strong>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="landing-stat-grid">
            {platformStats.map((item) => (
              <article className="landing-stat" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section" id="roles">
        <div className="landing-section-heading">
          <span className="landing-section-kicker">Role-based experience</span>
          <h2>Each workspace is shaped around a different job to be done.</h2>
        </div>

        <div className="landing-role-grid">
          {roleCards.map((role) => (
            <article className="landing-card role-card" key={role.title}>
              <p className="landing-card-label">{role.title}</p>
              <h3>{role.title} get focused tools, not mixed screens.</h3>
              <p>{role.text}</p>
              <Link className="landing-inline-link" to={role.actionLink}>
                {role.actionLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section workflow-section" id="workflow">
        <div className="landing-section-heading narrow">
          <span className="landing-section-kicker">How it works</span>
          <h2>A cleaner path from discovery to store operations to platform governance.</h2>
        </div>

        <div className="landing-flow">
          {featureSteps.map((step, index) => (
            <article className="landing-flow-step" key={step.title}>
              <span className="landing-step-number">0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <span className="landing-section-kicker">Start here</span>
          <h2>Enter as a buyer, seller, or platform operator.</h2>
          <p>
            Create a new account to begin with the right role-aware experience,
            or sign in to continue where your workflow left off.
          </p>
        </div>

        <div className="landing-actions">
          <Link className="landing-button primary" to="/signup?role=USER">
            Join as buyer
          </Link>
          <Link className="landing-button secondary" to="/signup?role=SELLER">
            Join as seller
          </Link>
          <Link className="landing-button ghost" to="/login">
            Admin or existing user login
          </Link>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;

import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

const platformStats = [
  { value: "3 workspaces", label: "Different areas for buyers, sellers, and admins" },
  { value: "Role-based", label: "Each role sees only the tools it needs" },
  { value: "Eco-focused", label: "Shopping decisions supported by sustainability data" },
];

const roleCards = [
  {
    eyebrow: "Buyer portal",
    title: "Shop with clarity",
    summary: "Made for customers who want an easier way to browse, buy, and review sustainable choices.",
    sectionTitle: "What buyers can do",
    highlights: [
      "Browse products with clearer sustainability context",
      "Manage cart and wishlist in one shopping flow",
      "Track orders and review post-purchase insights",
    ],
    actionLabel: "Join as buyer",
    actionLink: "/signup?role=USER",
  },
  {
    eyebrow: "Seller portal",
    title: "Run your store",
    summary: "Built for businesses that need a separate workspace to manage products, store details, and orders.",
    sectionTitle: "What sellers can do",
    highlights: [
      "Create and manage product listings",
      "Handle store orders and fulfillment progress",
      "Maintain store identity and seller profile details",
    ],
    actionLabel: "Start selling",
    actionLink: "/signup?role=SELLER",
  },
  {
    eyebrow: "Admin portal",
    title: "Control the platform",
    summary: "Designed for platform operators who need one place to review approvals, moderation, and system activity.",
    sectionTitle: "What admins can do",
    highlights: [
      "Approve sellers and manage user roles",
      "Review product and catalog activity",
      "Monitor platform operations from one control area",
    ],
    actionLabel: "Admin sign in",
    actionLink: "/login",
  },
];

const platformModules = [
  {
    title: "Marketplace core",
    text: "Catalog, checkout, seller work, and admin controls are connected in one shared platform.",
  },
  {
    title: "Approval flow",
    text: "Seller onboarding and product review are built into the platform, not handled outside it.",
  },
  {
    title: "Sustainability insights",
    text: "Carbon-related information is part of the shopping experience instead of an afterthought.",
  },
];

const featureSteps = [
  {
    title: "Start with the right role",
    text: "Visitors can begin as buyers or sellers from one simple homepage.",
  },
  {
    title: "Use the right workspace",
    text: "After login, each account lands in a dedicated dashboard built for that role.",
  },
  {
    title: "Manage the platform",
    text: "Admins can handle approvals, moderation, and oversight from one control area.",
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
          <a href="#solutions">Solutions</a>
          <a href="#workflow">Workflow</a>
        </nav>

        <div className="landing-topbar-actions">
          <Link className="landing-text-link" to="/login">
            Login
          </Link>
          <Link className="landing-button primary compact" to="/signup?role=USER">
            Start Free
          </Link>
        </div>
      </header>

      <section className="landing-hero" id="platform">
        <div className="landing-copy">
          <span className="landing-kicker">SaaS commerce platform</span>
          <h1>One platform for shopping, selling, and marketplace management.</h1>
          <p>
            EcoBazaarX gives buyers, sellers, and admins their own clear
            workspace inside one platform. That means shopping stays simple,
            selling stays organized, and admin work stays under control.
          </p>

          <div className="landing-actions">
            <Link className="landing-button primary" to="/signup?role=USER">
              Create buyer account
            </Link>
            <Link className="landing-button secondary" to="/signup?role=SELLER">
              Create seller account
            </Link>
          </div>

          <div className="landing-badges">
            <span>Buyer journeys</span>
            <span>Seller operations</span>
            <span>Admin governance</span>
          </div>
        </div>

        <div className="landing-hero-stack">
          <div className="landing-card spotlight">
            <p className="landing-card-label">Platform snapshot</p>
            <h2>One product with separate spaces for each role.</h2>
            <p>
              Each role gets the right routes, actions, and data without mixing
              buyer, seller, and admin tasks together.
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
                  <span>Seller Queue</span>
                  <span>Catalog Review</span>
                  <span>Orders</span>
                </div>

                <div className="console-main">
                  <div className="console-chart-card">
                    <strong>Marketplace health</strong>
                    <div className="console-chart-bars">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="console-metric-row">
                    <div>
                      <small>Pending approvals</small>
                      <strong>18 stores</strong>
                    </div>
                    <div>
                      <small>Reviewed inventory</small>
                      <strong>264 SKUs</strong>
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

      <section className="landing-section" id="solutions">
        <div className="landing-section-heading">
          <span className="landing-section-kicker">Role portals</span>
          <h2>Each role gets its own clear area in the product.</h2>
        </div>

        <div className="landing-role-grid">
          {roleCards.map((role) => (
            <article className="landing-card role-card" key={role.title}>
              <div className="role-card-header">
                <p className="landing-card-label">{role.eyebrow}</p>
                <h3>{role.title}</h3>
              </div>
              <div className="landing-card-body">
                <p className="role-card-summary">{role.summary}</p>
                <div className="role-card-section">
                  <h4>{role.sectionTitle}</h4>
                </div>
                <ul className="role-card-list">
                  {role.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="role-card-footer">
                <Link className="landing-inline-link" to={role.actionLink}>
                  {role.actionLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section platform-section">
        <div className="landing-section-heading narrow">
          <span className="landing-section-kicker">Platform modules</span>
          <h2>Core parts of the platform work together in one system.</h2>
        </div>

        <div className="landing-module-grid">
          {platformModules.map((module) => (
            <article className="landing-module" key={module.title}>
              <div className="landing-card-body">
                <h3>{module.title}</h3>
                <p>{module.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section workflow-section" id="workflow">
        <div className="landing-section-heading narrow">
          <span className="landing-section-kicker">How it works</span>
          <h2>The platform stays simple from signup to daily use.</h2>
        </div>

        <div className="landing-flow">
          {featureSteps.map((step, index) => (
            <article className="landing-flow-step" key={step.title}>
              <span className="landing-step-number">0{index + 1}</span>
              <div className="landing-card-body">
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
          <h2>Choose how you want to use EcoBazaarX.</h2>
          <p>
            Sign up as a buyer, start as a seller, or log in if you already
            have an account.
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

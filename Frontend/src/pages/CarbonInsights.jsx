import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ added
import MainNavbar from "../components/MainNavbar";
import { getStoredUser } from "../services/authService";
import { fetchUserInsights, fetchAdminAnalytics } from "../services/insightsService"; 
import "../styles/CarbonInsights.css";

// SVG Line Path Helper - Fixed to handle dynamic backend values
const buildLinePath = (values, width, height, padding) => {
  if (!values || values.length <= 1) return "";
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1; // ✅ FIX

  const stepX = (width - padding * 2) / (values.length - 1);
  
  return values.map((val, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
};

const downloadTextFile = (filename, content) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

function CarbonInsights() {
  const navigate = useNavigate(); // ✅ added
  const user = getStoredUser();
  const [insightData, setInsightData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState(user?.role === "ADMIN" ? "merchant" : "user");

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      setError("");
      try {
        if (user?.role === "ADMIN") {
          const aData = await fetchAdminAnalytics();
          setAdminData(aData);
          setInsightData({
            totalFootprint: 0,
            averageMonthly: 0,
            bestMonth: "N/A",
            monthlyTrends: [],
            topProducts: [],
          });
        } else {
          const data = await fetchUserInsights();
          setInsightData(data);
        }
      } catch (err) {
        setError(err.message || "Unable to load sustainability data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    loadInsights();
  }, [user?.role]);

  const trendValues = insightData?.monthlyTrends?.map((t) => t.value) || [];
  const trendLabels = insightData?.monthlyTrends?.map((t) => t.label) || [];
  const linePath = buildLinePath(trendValues, 520, 200, 24);

  // ✅ SAFE MAX FIX (important)
  const maxEmission = Math.max(
    ...(insightData?.topProducts?.map((p) => p.emission) || [1])
  );

  const handleDownloadReport = () => {
    if (!insightData) return;
    const summary = [
      "EcoBazaarX Carbon Report",
      `User: ${user?.name}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      "---------------------------",
      `Total Footprint: ${insightData.totalFootprint.toFixed(2)} kg CO2e`,
      `Monthly Average: ${insightData.averageMonthly.toFixed(2)} kg CO2e`,
      `Best Performing Month: ${insightData.bestMonth}`,
      "",
      "Top Eco-Friendly Contributions:",
      ...insightData.topProducts.map(p => `- ${p.name}: ${p.emission.toFixed(2)} kg saved`)
    ].join("\n");
    
    downloadTextFile(`eco-report-${user?.name}.txt`, summary);
  };

  if (loading) return <div className="loading-state"><h3>Calculating your impact...</h3></div>;
  if (error) return <div className="error-state"><h3>{error}</h3></div>;

  return (
    <>
      <MainNavbar />
      <div className="insights-page">
        <section className="insights-hero">
          <div className="insights-hero-content">
            <p className="hero-tag">Carbon Insights</p>
            <h1>Track impact, unlock achievements, and prove green outcomes.</h1>
            <div className="hero-actions">
              <button className="solid-btn" onClick={handleDownloadReport}>Download Eco Report</button>
              {user?.role === "ADMIN" && (
                <button className="ghost-btn" onClick={() => setActiveView(activeView === "user" ? "merchant" : "user")}>
                  Switch to {activeView === "user" ? "Merchant" : "User"} View
                </button>
              )}
            </div>
          </div>
          <div className="insights-hero-panel">
            <div className="impact-card">
              <span>Monthly Avg</span>
              <h3>{insightData?.averageMonthly?.toFixed(1)} kg CO₂</h3>
              <p>Best month: {insightData?.bestMonth}</p>
            </div>
            <div className="impact-card">
              <span>Total Footprint</span>
              <h3>{insightData?.totalFootprint?.toFixed(1)} kg CO₂</h3>
              <p>Impact across all orders</p>
            </div>
          </div>
        </section>

        {activeView === "user" ? (
          <section className="insights-grid">
      <div className="card chart-card professional-chart">
  <div className="chart-header">
    <h3>Monthly Footprint Trend</h3>
    <span className="chart-subtitle">CO₂ emissions over time</span>
  </div>

  <svg viewBox="0 0 520 220" className="line-chart">

    {/* ✅ GRID LINES */}
    {[0, 1, 2, 3, 4].map((i) => (
      <line
        key={i}
        x1="40"
        y1={40 + i * 35}
        x2="500"
        y2={40 + i * 35}
        stroke="#eee"
        strokeWidth="1"
      />
    ))}

    {/* ✅ LINE PATH */}
    <path
      d={linePath}
      className="line-path"
      fill="none"
      stroke="#2ecc71"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* ✅ DATA POINTS */}
    {trendValues.map((val, i) => {
      const min = Math.min(...trendValues, 0);
      const max = Math.max(...trendValues, 1);
      const range = max - min || 1;

      const x = 40 + i * ((520 - 80) / (trendValues.length - 1 || 1));
      const y = 200 - 40 - ((val - min) / range) * (200 - 80);

      return (
        <g key={i} className="point-group">
          <circle cx={x} cy={y} r="4" className="point-dot" />

          {/* Tooltip */}
          <title>{val.toFixed(2)} kg CO₂</title>
        </g>
      );
    })}
  </svg>

  {/* ✅ X LABELS */}
  <div className="chart-labels">
    {trendLabels.map((label) => (
      <span key={label}>{label}</span>
    ))}
  </div>
</div>

          
           <div className="card bar-card">
  <h3>Top Eco-Friendly Products</h3>

  <div className="bar-chart">
    {insightData?.topProducts
      ?.filter((item) => item.emission < 20) // ✅ only low emission
      ?.map((item) => (
        <div
          key={item.name}
          className="bar-item"
          onClick={() => navigate(`/products/${item.id}`)}
          style={{ cursor: "pointer" }}
        >
          <div className="bar-image-wrapper">
            <img
              src={item.image}
              alt={item.name}
              className="bar-image"
              // onError={(e) => (e.target.src = "/placeholder.png")} // ✅ safety
            />
          </div>

          <div
            className="bar"
            style={{
              height: `${(item.emission / maxEmission) * 100}%`,
            }}
          />

          <span>{item.name}</span>
          <strong>{item.emission.toFixed(1)}kg</strong>
        </div>
      ))}
  </div>
</div>

            <div className="card badge-card">
              <h3>Eco Achievements</h3>
              <div className="badge-list">
                <div className={`badge ${insightData?.totalFootprint < 50 ? 'earned' : 'progress'}`}>
                  <h4>Low-Carbon Shopper</h4>
                  <p>Keep footprint under 50kg</p>
                </div>
                <div className={`badge ${insightData?.topProducts?.length >= 3 ? 'earned' : 'locked'}`}>
                  <h4>Diversity Advocate</h4>
                  <p>Saved carbon across 3+ categories</p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="insights-grid">
            <div className="card metric-card">
              <h3>Global Platform Impact</h3>
              <div className="metric-tile">
                <span>Total System Carbon Saved</span>
                <strong>{adminData?.globalCarbonSaved?.toFixed(1) || 0} kg</strong>
              </div>
            </div>
            <div className="card info-card">
              <h3>Management Module</h3>
              <p>Use the Admin Panel to verify green certifications and audit SKUs.</p>
              <button className="solid-btn">Manage Product Verifications</button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default CarbonInsights;

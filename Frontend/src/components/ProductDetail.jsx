import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../services/productService";
import "../styles/ProductDetail.css";

function getEcoTone(total) {
  if (total <= 1.5) return "best";
  if (total <= 2.5) return "great";
  if (total <= 3.8) return "good";
  if (total <= 5) return "warn";
  return "risk";
}

function ProductDetail() {
  const { productId } = useParams();

  const product = useMemo(
    () => getProductById(productId),
    [productId]
  );

  if (!product) {
    return (
      <main className="detail-page">
        <div className="detail-shell">
          <h2>Product not found</h2>
          <p>This item may have been removed or not yet synced.</p>
          <Link to="/products" className="back-btn">
            Return to catalog
          </Link>
        </div>
      </main>
    );
  }

  const total = product.carbonData.totalCO2ePerKg;
  const ecoTone = getEcoTone(total);
  const { manufacturing, packaging, transport, handling } =
    product.carbonData.breakdown;

  return (
    <main className="detail-page">
      <div className="detail-shell">
        <Link to="/products" className="back-btn">
          Back to Product Catalog
        </Link>

        <section className="detail-main">
          <img src={product.image} alt={product.name} />

          <div className="detail-content">
            <div className="head-row">
              <h1>{product.name}</h1>
              <span className={`eco-tag ${ecoTone}`}>{total} CO2e/kg</span>
            </div>
            <p className="subtitle">
              {product.category} | Seller: {product.seller}
            </p>
            <p className="description">{product.description}</p>

            <div className="price-line">${product.price.toFixed(2)}</div>

            <div className="impact-breakdown">
              <h2>Carbon Impact Breakdown</h2>
              <div className="impact-grid">
                <article>
                  <p>Manufacturing</p>
                  <strong>{manufacturing} CO2e/kg</strong>
                </article>
                <article>
                  <p>Packaging</p>
                  <strong>{packaging} CO2e/kg</strong>
                </article>
                <article>
                  <p>Transport</p>
                  <strong>{transport} CO2e/kg</strong>
                </article>
                <article>
                  <p>Handling</p>
                  <strong>{handling} CO2e/kg</strong>
                </article>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProductDetail;

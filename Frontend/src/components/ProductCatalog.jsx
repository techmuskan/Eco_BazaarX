import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts, saveProducts } from "../services/productService";
import "../styles/ProductCatalog.css";

const CARBON_FILTERS = ["all", "low", "medium", "high"];
const MATERIAL_MULTIPLIERS = {
  plant: 0.7,
  glass: 1.1,
  plastic: 1.45,
  metal: 1.3,
  mixed: 1.2
};
const PACKAGING_MULTIPLIERS = {
  compostable: 0.7,
  recyclable: 0.9,
  standard: 1.2
};

function getEcoRating(total) {
  if (total <= 1.5) return { label: "A+", tone: "best" };
  if (total <= 2.5) return { label: "A", tone: "great" };
  if (total <= 3.8) return { label: "B", tone: "good" };
  if (total <= 5) return { label: "C", tone: "warn" };
  return { label: "D", tone: "risk" };
}

function getCarbonBucket(total) {
  if (total <= 2.5) return "low";
  if (total <= 4.5) return "medium";
  return "high";
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function buildBreakdown(total) {
  return {
    manufacturing: round(total * 0.45),
    packaging: round(total * 0.16),
    transport: round(total * 0.26),
    handling: round(total * 0.13)
  };
}

function calculateAutoCarbon(formData) {
  const weight = Number(formData.weightKg || 0);
  const distance = Number(formData.transportKm || 0);
  const materialFactor = MATERIAL_MULTIPLIERS[formData.material] || 1;
  const packagingFactor = PACKAGING_MULTIPLIERS[formData.packagingType] || 1;
  const manufacturing = 0.55 * weight * materialFactor;
  const transport = 0.0022 * distance * weight;
  const packaging = 0.2 * packagingFactor;
  const handling = 0.12 * weight;
  const total = round(manufacturing + transport + packaging + handling);

  return {
    totalCO2ePerKg: total,
    breakdown: {
      manufacturing: round(manufacturing),
      packaging: round(packaging),
      transport: round(transport),
      handling: round(handling)
    }
  };
}

function getInitialForm() {
  return {
    id: "",
    name: "",
    category: "",
    seller: "",
    price: "",
    image: "",
    description: "",
    isEcoFriendly: true,
    carbonMethod: "manual",
    manualCO2e: "",
    material: "mixed",
    weightKg: "",
    transportKm: "",
    packagingType: "recyclable"
  };
}

function ProductCatalog() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(getProducts());
  const [search, setSearch] = useState("");
  const [ecoOnly, setEcoOnly] = useState(false);
  const [carbonFilter, setCarbonFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(getInitialForm());
  const [error, setError] = useState("");
  const [carbonPreview, setCarbonPreview] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.trim().toLowerCase();
      const inSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.seller.toLowerCase().includes(query);

      const ecoMatch = ecoOnly ? product.isEcoFriendly : true;
      const bucket = getCarbonBucket(product.carbonData.totalCO2ePerKg);
      const carbonMatch = carbonFilter === "all" ? true : bucket === carbonFilter;

      return inSearch && ecoMatch && carbonMatch;
    });
  }, [products, search, ecoOnly, carbonFilter]);

  const resetForm = () => {
    setForm(getInitialForm());
    setEditingId(null);
    setError("");
    setCarbonPreview(null);
  };

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const runAutoPreview = () => {
    const preview = calculateAutoCarbon(form);
    setCarbonPreview(preview);
  };

  const onSubmit = (event) => {
    event.preventDefault();

    if (!form.name || !form.category || !form.seller || !form.price) {
      setError("Name, category, seller, and price are required.");
      return;
    }

    let carbonData = null;
    if (form.carbonMethod === "manual") {
      const manual = Number(form.manualCO2e);
      if (!manual || manual <= 0) {
        setError("Please enter a valid manual CO2e/kg value.");
        return;
      }
      carbonData = {
        method: "manual",
        material: form.material,
        totalCO2ePerKg: round(manual),
        breakdown: buildBreakdown(round(manual))
      };
    } else {
      carbonData = {
        method: "auto",
        material: form.material,
        ...calculateAutoCarbon(form)
      };
      if (!carbonData.totalCO2ePerKg || carbonData.totalCO2ePerKg <= 0) {
        setError("Auto calculation produced an invalid carbon value.");
        return;
      }
    }

    const item = {
      id: editingId || `P-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: form.name.trim(),
      category: form.category.trim(),
      seller: form.seller.trim(),
      price: Number(form.price),
      image:
        form.image.trim() ||
        "https://images.unsplash.com/photo-1584473457409-ce311d574f23?auto=format&fit=crop&w=900&q=80",
      description: form.description.trim() || "No product description provided yet.",
      isEcoFriendly: form.isEcoFriendly,
      carbonData
    };

    if (editingId) {
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === editingId ? item : p));
        saveProducts(next);
        return next;
      });
    } else {
      setProducts((prev) => {
        const next = [item, ...prev];
        saveProducts(next);
        return next;
      });
    }
    resetForm();
  };

  const onEdit = (product) => {
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      seller: product.seller,
      price: String(product.price),
      image: product.image,
      description: product.description,
      isEcoFriendly: product.isEcoFriendly,
      carbonMethod: product.carbonData.method,
      manualCO2e:
        product.carbonData.method === "manual"
          ? String(product.carbonData.totalCO2ePerKg)
          : "",
      material: product.carbonData.material || "mixed",
      weightKg: "1",
      transportKm: "120",
      packagingType: "recyclable"
    });
    setError("");
    setCarbonPreview(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = (productId) => {
    setProducts((prev) => {
      const next = prev.filter((product) => product.id !== productId);
      saveProducts(next);
      return next;
    });
    if (editingId === productId) resetForm();
  };

  return (
    <main className="catalog-page">
      <header className="catalog-hero">
        <div>
          <p className="hero-eyebrow">Eco-BazaarX | Product Catalog & Carbon Module</p>
          <h1>Smart Product Catalog with Carbon Intelligence</h1>
          <p className="hero-sub">
            Add products, estimate carbon footprint per kg, and help buyers choose
            lower-emission options faster.
          </p>
        </div>
        <button className="ghost-btn" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <section className="catalog-layout">
        <article className="product-form-panel">
          <h2>{editingId ? "Update Product Listing" : "Create Product Listing"}</h2>
          <form onSubmit={onSubmit} className="product-form">
            <div className="field-grid">
              <label>
                Product Name
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Organic quinoa"
                />
              </label>
              <label>
                Category
                <input
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  placeholder="Grains, Home Care, Lifestyle..."
                />
              </label>
              <label>
                Seller / Admin
                <input
                  name="seller"
                  value={form.seller}
                  onChange={onChange}
                  placeholder="Green Farm Collective"
                />
              </label>
              <label>
                Price (USD)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={onChange}
                  placeholder="9.99"
                />
              </label>
            </div>

            <label>
              Image URL
              <input
                name="image"
                value={form.image}
                onChange={onChange}
                placeholder="https://..."
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={3}
                placeholder="Describe sustainability attributes, sourcing, and product benefits."
              />
            </label>

            <div className="toggle-line">
              <label className="inline-check">
                <input
                  type="checkbox"
                  name="isEcoFriendly"
                  checked={form.isEcoFriendly}
                  onChange={onChange}
                />
                Eco-friendly certified
              </label>
            </div>

            <div className="carbon-panel">
              <h3>Carbon Footprint Input</h3>
              <div className="method-row">
                <label className="inline-check">
                  <input
                    type="radio"
                    name="carbonMethod"
                    value="manual"
                    checked={form.carbonMethod === "manual"}
                    onChange={onChange}
                  />
                  Manual CO2e/kg
                </label>
                <label className="inline-check">
                  <input
                    type="radio"
                    name="carbonMethod"
                    value="auto"
                    checked={form.carbonMethod === "auto"}
                    onChange={onChange}
                  />
                  Auto-calculate
                </label>
              </div>

              {form.carbonMethod === "manual" ? (
                <label>
                  Carbon Footprint (CO2e/kg)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="manualCO2e"
                    value={form.manualCO2e}
                    onChange={onChange}
                    placeholder="2.1"
                  />
                </label>
              ) : (
                <>
                  <div className="field-grid">
                    <label>
                      Product Weight (kg)
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        name="weightKg"
                        value={form.weightKg}
                        onChange={onChange}
                        placeholder="1.2"
                      />
                    </label>
                    <label>
                      Transport Distance (km)
                      <input
                        type="number"
                        min="0"
                        step="1"
                        name="transportKm"
                        value={form.transportKm}
                        onChange={onChange}
                        placeholder="220"
                      />
                    </label>
                    <label>
                      Material Type
                      <select name="material" value={form.material} onChange={onChange}>
                        <option value="plant">Plant-based</option>
                        <option value="glass">Glass</option>
                        <option value="plastic">Plastic</option>
                        <option value="metal">Metal</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </label>
                    <label>
                      Packaging
                      <select
                        name="packagingType"
                        value={form.packagingType}
                        onChange={onChange}
                      >
                        <option value="compostable">Compostable</option>
                        <option value="recyclable">Recyclable</option>
                        <option value="standard">Standard</option>
                      </select>
                    </label>
                  </div>
                  <button type="button" className="preview-btn" onClick={runAutoPreview}>
                    Preview Auto Carbon
                  </button>
                  {carbonPreview && (
                    <p className="carbon-preview">
                      Estimated: <strong>{carbonPreview.totalCO2ePerKg} CO2e/kg</strong>
                    </p>
                  )}
                </>
              )}
            </div>

            {error && <p className="error-line">{error}</p>}

            <div className="actions-row">
              <button type="submit" className="primary-btn">
                {editingId ? "Save Product" : "Add Product"}
              </button>
              {(editingId || form.name || form.category || form.seller) && (
                <button type="button" className="ghost-btn" onClick={resetForm}>
                  Clear
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="products-panel">
          <div className="panel-top">
            <h2>Product Browse & Eco Filters</h2>
            <p>{filteredProducts.length} items visible</p>
          </div>

          <div className="filters-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, category, seller..."
            />
            <label className="inline-check">
              <input
                type="checkbox"
                checked={ecoOnly}
                onChange={(event) => setEcoOnly(event.target.checked)}
              />
              Eco-only
            </label>
            <select
              value={carbonFilter}
              onChange={(event) => setCarbonFilter(event.target.value)}
            >
              {CARBON_FILTERS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All carbon levels" : `${option} carbon`}
                </option>
              ))}
            </select>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => {
              const rating = getEcoRating(product.carbonData.totalCO2ePerKg);
              return (
                <article key={product.id} className="product-card">
                  <img src={product.image} alt={product.name} />
                  <div className="product-body">
                    <div className="card-head">
                      <h3>{product.name}</h3>
                      <span className={`badge badge-${rating.tone}`}>Eco {rating.label}</span>
                    </div>
                    <p className="meta-line">
                      {product.category} | Seller: {product.seller}
                    </p>
                    <p className="description-line">{product.description}</p>
                    <div className="stats-row">
                      <p>
                        <strong>${product.price.toFixed(2)}</strong>
                      </p>
                      <p>{product.carbonData.totalCO2ePerKg} CO2e/kg</p>
                    </div>
                    <div className="card-actions">
                      <Link to={`/products/${product.id}`} className="link-btn">
                        View Impact
                      </Link>
                      <button className="text-btn" onClick={() => onEdit(product)}>
                        Edit
                      </button>
                      <button
                        className="text-btn danger"
                        onClick={() => onDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </article>
      </section>
    </main>
  );
}

export default ProductCatalog;

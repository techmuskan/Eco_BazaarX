import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import MainNavbar from "./MainNavbar";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct
} from "../services/productService";
import { getResolvedRole } from "../services/authService";
import { uploadProductImage } from "../services/cloudinaryService";
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

function round(v) {
  return Math.round(v * 100) / 100;
}

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

function buildBreakdown(total) {
  return {
    manufacturing: round(total * 0.45),
    packaging: round(total * 0.16),
    transport: round(total * 0.26),
    handling: round(total * 0.13)
  };
}

function calculateAutoCarbon(form) {
  const weight = Number(form.weightKg || 0);
  const distance = Number(form.transportKm || 0);
  const materialFactor = MATERIAL_MULTIPLIERS[form.material] || 1;
  const packagingFactor = PACKAGING_MULTIPLIERS[form.packagingType] || 1;

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
  const ITEMS_PER_PAGE = 8;
  const navigate = useNavigate();
  const currentRole = getResolvedRole() || "USER";
  const isAdmin = currentRole === "ADMIN";
  const { addToCart, totalItems } = useCart();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(getInitialForm());
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [ecoOnly, setEcoOnly] = useState(false);
  const [carbonFilter, setCarbonFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState("");

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [page, setPage] = useState(1);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const query = search.toLowerCase();
      const matchSearch =
        !query ||
        (p.name || "").toLowerCase().includes(query) ||
        (p.category || "").toLowerCase().includes(query) ||
        (p.seller || "").toLowerCase().includes(query);

      const ecoMatch = ecoOnly ? p.isEcoFriendly : true;

      const total = Number(p?.carbonData?.totalCO2ePerKg || 0);
      const bucket = getCarbonBucket(total);
      const carbonMatch = carbonFilter === "all" || bucket === carbonFilter;

      return matchSearch && ecoMatch && carbonMatch;
    });
  }, [products, search, ecoOnly, carbonFilter]);

  const pagedProducts = useMemo(
    () => filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [filteredProducts, page]
  );
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [search, ecoOnly, carbonFilter]);

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setFormError("");
  };

  const resetForm = () => {
    setForm(getInitialForm());
    setEditingId(null);
    setSelectedImageFile(null);
    setFormError("");
  };

  const onUploadImage = async () => {
    if (!selectedImageFile) {
      setFormError("Select an image first.");
      return;
    }
    try {
      setUploadingImage(true);
      const url = await uploadProductImage(selectedImageFile);
      setForm(prev => ({ ...prev, image: url }));
      setSelectedImageFile(null);
      setFormError("");
      showToast("Image uploaded successfully.", "success");
    } catch (e) {
      setFormError(e.message || "Image upload failed");
      showToast(e.message || "Image upload failed.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setFormError("");
    setApiError("");

    let carbonData;

    if (form.carbonMethod === "manual") {
      const manual = Number(form.manualCO2e);
      if (!Number.isFinite(manual) || manual <= 0) {
        setFormError("Manual CO2 value must be greater than 0.");
        return;
      }
      carbonData = {
        method: "manual",
        totalCO2ePerKg: round(manual),
        breakdown: buildBreakdown(manual)
      };
    } else {
      carbonData = { method: "auto", ...calculateAutoCarbon(form) };
    }

    const payload = {
      name: form.name,
      category: form.category,
      seller: form.seller,
      price: Number(form.price),
      image: form.image,
      description: form.description,
      isEcoFriendly: form.isEcoFriendly,
      carbonData
    };

    try {
      setSaving(true);
      if (editingId) {
        const updated = await updateProduct(editingId, payload);
        setProducts(prev => prev.map(p => (p.id === editingId ? updated : p)));
        showToast("Product updated.", "success");
      } else {
        const created = await createProduct(payload);
        setProducts(prev => [created, ...prev]);
        showToast("Product created.", "success");
      }
      resetForm();
    } catch (e) {
      setApiError(e.message);
      showToast(e.message || "Product save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = p => {
    setEditingId(p.id);
    setForm({
      ...getInitialForm(),
      ...p,
      manualCO2e: p?.carbonData?.totalCO2ePerKg || ""
    });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async id => {
    if (!window.confirm("Delete product?")) return;
    try {
      setDeletingId(id);
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast("Product deleted.", "success");
    } catch (e) {
      setApiError(e.message);
      showToast(e.message || "Delete failed.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="catalog-page">
      <MainNavbar />
      <header className="catalog-hero">
        <div>
          <p className="hero-eyebrow">Sustainable Commerce</p>
          <h1>Eco Product Catalog</h1>
          <p className="hero-sub">
            Explore products with carbon visibility, then use Smart Cart to compare
            emissions before checkout.
          </p>
        </div>
        <div className="actions-row">
          <button onClick={() => navigate("/dashboard")} className="ghost-btn">
            Dashboard
          </button>
          <button onClick={() => navigate("/cart")} className="ghost-btn">
            Cart ({totalItems})
          </button>
        </div>
      </header>

      <section className="catalog-layout">
        {isAdmin && (
          <article className="product-form-panel">
            <h2>{editingId ? "Update Product" : "Add Product"}</h2>

            <form onSubmit={onSubmit} className="product-form">
              <div className="field-grid">
                <label>
                  Name
                  <input name="name" value={form.name} onChange={onChange} required />
                  <small>Product name as shown to customers.</small>
                </label>
                <label>
                  Category
                  <input name="category" value={form.category} onChange={onChange} />
                </label>
                <label>
                  Seller
                  <input name="seller" value={form.seller} onChange={onChange} />
                </label>
                <label>
                  Price
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={onChange}
                    min="0"
                    step="0.01"
                    required
                  />
                  <small>Use market price in USD.</small>
                </label>
                <label>
                  Image URL
                  <input name="image" value={form.image} onChange={onChange} />
                </label>
                <label>
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setSelectedImageFile(e.target.files?.[0] || null)}
                  />
                  <small>Recommended: square or 4:3 product photo.</small>
                </label>
              </div>

              <button
                type="button"
                className="preview-btn"
                onClick={onUploadImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? "Uploading..." : "Upload to Cloudinary"}
              </button>

              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={4}
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
                  Eco Friendly
                </label>
              </div>

              <div className="carbon-panel">
                <h3>Carbon Input Method</h3>
                <div className="method-row">
                  <label className="inline-check">
                    <input
                      type="radio"
                      name="carbonMethod"
                      value="manual"
                      checked={form.carbonMethod === "manual"}
                      onChange={onChange}
                    />
                    Manual
                  </label>
                  <label className="inline-check">
                    <input
                      type="radio"
                      name="carbonMethod"
                      value="auto"
                      checked={form.carbonMethod === "auto"}
                      onChange={onChange}
                    />
                    Auto Estimate
                  </label>
                </div>

                {form.carbonMethod === "manual" ? (
                  <label>
                    Total CO2e per item (kg)
                    <input
                      name="manualCO2e"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.manualCO2e}
                      onChange={onChange}
                    />
                    <small>Must be greater than 0.</small>
                  </label>
                ) : (
                  <div className="field-grid">
                    <label>
                      Material
                      <select name="material" value={form.material} onChange={onChange}>
                        {Object.keys(MATERIAL_MULTIPLIERS).map(material => (
                          <option key={material} value={material}>
                            {material}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Weight (kg)
                      <input
                        name="weightKg"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.weightKg}
                        onChange={onChange}
                      />
                    </label>
                    <label>
                      Transport (km)
                      <input
                        name="transportKm"
                        type="number"
                        min="0"
                        step="1"
                        value={form.transportKm}
                        onChange={onChange}
                      />
                    </label>
                    <label>
                      Packaging
                      <select
                        name="packagingType"
                        value={form.packagingType}
                        onChange={onChange}
                      >
                        {Object.keys(PACKAGING_MULTIPLIERS).map(packaging => (
                          <option key={packaging} value={packaging}>
                            {packaging}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>

              {formError && <p className="error-line">{formError}</p>}
              {apiError && <p className="error-line">{apiError}</p>}

              <div className="actions-row">
                <button className="primary-btn" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
                {editingId && (
                  <button type="button" className="text-btn" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </article>
        )}

        <article className="products-panel">
          <div className="panel-top">
            <h2>Product List</h2>
            <p>{filteredProducts.length} visible • Role: {currentRole}</p>
          </div>

          {!isAdmin && apiError && <p className="error-line">{apiError}</p>}
          {apiError && (
            <button className="text-btn" type="button" onClick={loadProducts}>
              Retry Loading Products
            </button>
          )}

          <div className="filters-row">
            <input
              placeholder="Search by name, category, seller..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <label className="inline-check">
              <input
                type="checkbox"
                checked={ecoOnly}
                onChange={e => setEcoOnly(e.target.checked)}
              />
              Eco only
            </label>
            <select value={carbonFilter} onChange={e => setCarbonFilter(e.target.value)}>
              {CARBON_FILTERS.map(filter => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="skeleton-grid" aria-label="Loading products">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          )}

          <div className="product-grid">
            {pagedProducts.map(p => {
              const totalCO2 = Number(p?.carbonData?.totalCO2ePerKg || 0);
              const rating = getEcoRating(totalCO2);
              return (
                <article key={p.id} className="product-card">
                  <img
                    src={p.image || "https://via.placeholder.com/600x400?text=EcoBazaar"}
                    alt={p.name}
                    loading="lazy"
                    onError={e => {
                      e.currentTarget.src = "https://via.placeholder.com/600x400?text=EcoBazaar";
                    }}
                  />
                  <div className="product-body">
                    <div className="card-head">
                      <h3>{p.name}</h3>
                      <span className={`badge badge-${rating.tone}`}>{rating.label}</span>
                    </div>
                    <p className="meta-line">
                      {(p.category || "General") + " • " + (p.seller || "EcoBazaar Seller")}
                    </p>
                    <p className="description-line">
                      {p.description || "No description available."}
                    </p>
                    <div className="stats-row">
                      <strong>${Number(p.price || 0).toFixed(2)}</strong>
                      <span>{totalCO2.toFixed(2)} kg CO2e</span>
                    </div>

                    <div className="card-actions">
                      <Link className="link-btn" to={`/products/${p.id}`}>
                        View Impact
                      </Link>
                      <button
                        className="text-btn"
                        onClick={() => {
                          addToCart(p, 1);
                          showToast(`${p.name} added to cart.`, "success");
                        }}
                      >
                        Add to Cart
                      </button>
                      {isAdmin && (
                        <>
                          <button className="text-btn" onClick={() => onEdit(p)}>
                            Edit
                          </button>
                          <button
                            className="text-btn danger"
                            onClick={() => onDelete(p.id)}
                            disabled={deletingId === p.id}
                          >
                            {deletingId === p.id ? "Deleting..." : "Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {!loading && totalPages > 1 && (
            <div className="pagination-row">
              <button
                className="text-btn"
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <p>
                Page {page} of {totalPages}
              </p>
              <button
                className="text-btn"
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default ProductCatalog;

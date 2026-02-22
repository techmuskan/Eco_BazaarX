import { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
// Removed Link from the import below
import { useNavigate } from "react-router-dom"; 
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
=======
import { Link, useNavigate } from "react-router-dom";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4
} from "../services/productService";
import { uploadProductImage } from "../services/cloudinaryService";
import "../styles/ProductCatalog.css";

<<<<<<< HEAD
// Helper to check user role from token
function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

const CARBON_FILTERS = ["all", "low", "medium", "high"];
=======
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
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4

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

<<<<<<< HEAD
const getInitialForm = () => ({
  name: "",
  category: "",
  seller: "",
  price: "",
  image: "",
  description: "",
  isEcoFriendly: false,
  manualCO2e: "",
  manufacturing: 0,
  packaging: 0,
  transport: 0,
  handling: 0
});

function ProductCatalog() {
  const navigate = useNavigate();
  const userRole = getUserRole();
  const isAdmin = userRole === "ADMIN";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState(getInitialForm());
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [carbonFilter, setCarbonFilter] = useState("all");
=======
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
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [ecoOnly, setEcoOnly] = useState(false);
  const [carbonFilter, setCarbonFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(getInitialForm());
  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState("");
  const [carbonPreview, setCarbonPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
      setApiError("");
    } catch (err) {
      setApiError("Backend Server is unreachable. Check your Spring Boot API.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
=======
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await getProducts();
        if (isMounted) {
          setProducts(data);
          setApiError("");
        }
      } catch (error) {
        if (isMounted) {
          setApiError(error.message || "Failed to load products.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.trim().toLowerCase();
      const inSearch =
        query.length === 0 ||
        (product.name || "").toLowerCase().includes(query) ||
        (product.category || "").toLowerCase().includes(query) ||
        (product.seller || "").toLowerCase().includes(query);

      const ecoMatch = ecoOnly ? product.isEcoFriendly : true;
      const totalCO2ePerKg = Number(product?.carbonData?.totalCO2ePerKg || 0);
      const bucket = getCarbonBucket(totalCO2ePerKg);
      const carbonMatch = carbonFilter === "all" ? true : bucket === carbonFilter;

      return inSearch && ecoMatch && carbonMatch;
    });
  }, [products, search, ecoOnly, carbonFilter]);

  const resetForm = () => {
    setForm(getInitialForm());
    setEditingId(null);
    setFormError("");
    setCarbonPreview(null);
    setSelectedImageFile(null);
  };

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

<<<<<<< HEAD
  const onUploadImage = async () => {
    if (!selectedImageFile) return alert("Select a file first");
    try {
      setUploadingImage(true);
      const imageUrl = await uploadProductImage(selectedImageFile);
      setForm((prev) => ({ ...prev, image: imageUrl }));
      alert("Image uploaded to Cloudinary!");
    } catch (err) {
      alert("Image upload failed");
=======
  const runAutoPreview = () => {
    const preview = calculateAutoCarbon(form);
    setCarbonPreview(preview);
  };

  const onImageFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedImageFile(file);
  };

  const onUploadImage = async () => {
    if (!selectedImageFile) {
      setFormError("Please choose an image file first.");
      return;
    }

    try {
      setUploadingImage(true);
      setFormError("");
      const imageUrl = await uploadProductImage(selectedImageFile);
      setForm((prev) => ({ ...prev, image: imageUrl }));
      setSelectedImageFile(null);
    } catch (error) {
      setFormError(error.message || "Failed to upload image.");
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4
    } finally {
      setUploadingImage(false);
    }
  };

<<<<<<< HEAD
  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const productPayload = {
      name: form.name,
      category: form.category,
      seller: form.seller,
      price: parseFloat(form.price),
      image: form.image,
      description: form.description,
      isEcoFriendly: form.isEcoFriendly,
      carbonData: {
        method: "manual",
        totalCO2ePerKg: parseFloat(form.manualCO2e || 0),
        material: "General",
        breakdown: {
          manufacturing: parseFloat(form.manufacturing || 0),
          packaging: parseFloat(form.packaging || 0),
          transport: parseFloat(form.transport || 0),
          handling: parseFloat(form.handling || 0)
        }
      }
    };

    try {
      if (editingId) {
        await updateProduct(editingId, productPayload);
      } else {
        await createProduct(productPayload);
      }
      setForm(getInitialForm());
      setEditingId(null);
      fetchData(); 
    } catch (err) {
      setApiError("Failed to save product. Check permissions.");
=======
  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.category || !form.seller || !form.price) {
      setFormError("Name, category, seller, and price are required.");
      return;
    }

    let carbonData = null;
    if (form.carbonMethod === "manual") {
      const manual = Number(form.manualCO2e);
      if (!manual || manual <= 0) {
        setFormError("Please enter a valid manual CO2e/kg value.");
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
        setFormError("Auto calculation produced an invalid carbon value.");
        return;
      }
    }

    const item = {
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

    try {
      setSaving(true);
      setFormError("");
      setApiError("");

      if (editingId) {
        const updated = await updateProduct(editingId, item);
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await createProduct(item);
        setProducts((prev) => [created, ...prev]);
      }

      resetForm();
    } catch (error) {
      setApiError(error.message || "Failed to save product.");
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4
    } finally {
      setSaving(false);
    }
  };

<<<<<<< HEAD
  const onEdit = (p) => {
    setEditingId(p.id);
    setForm({
      ...p,
      manualCO2e: p.carbonData?.totalCO2ePerKg || "",
      manufacturing: p.carbonData?.breakdown?.manufacturing || 0,
      packaging: p.carbonData?.breakdown?.packaging || 0,
      transport: p.carbonData?.breakdown?.transport || 0,
      handling: p.carbonData?.breakdown?.handling || 0
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const bucket = getCarbonBucket(p.carbonData?.totalCO2ePerKg || 0);
      const matchCarbon = carbonFilter === "all" || bucket === carbonFilter;
      return matchSearch && matchCarbon;
    });
  }, [products, search, carbonFilter]);

  return (
    <main className="catalog-page">
      <header className="catalog-hero">
        <h1>Eco-BazaarX Catalog</h1>
        <button onClick={() => navigate("/dashboard")} className="ghost-btn">Dashboard</button>
      </header>

      <section className="catalog-layout">
        {isAdmin && (
          <article className="product-form-panel">
            <h2>{editingId ? "Update Product" : "Add New Product"}</h2>
            <form onSubmit={onSubmit} className="product-form">
              <input name="name" value={form.name} onChange={onChange} placeholder="Product Name" required />
              <input name="category" value={form.category} onChange={onChange} placeholder="Category" />
              <input name="price" type="number" value={form.price} onChange={onChange} placeholder="Price" required />
              <input name="image" value={form.image} onChange={onChange} placeholder="Image URL (Cloudinary)" />
              
              <div className="upload-section">
                <input type="file" onChange={(e) => setSelectedImageFile(e.target.files[0])} />
                <button type="button" onClick={onUploadImage} disabled={uploadingImage}>
                  {uploadingImage ? "Uploading..." : "Upload File"}
                </button>
              </div>

              <div className="carbon-inputs">
                <h4>Carbon Data (per kg)</h4>
                <input name="manualCO2e" type="number" value={form.manualCO2e} onChange={onChange} placeholder="Total CO2e" />
                <div className="field-grid">
                   <input name="manufacturing" type="number" value={form.manufacturing} onChange={onChange} placeholder="Mfg" />
                   <input name="packaging" type="number" value={form.packaging} onChange={onChange} placeholder="Pack" />
                </div>
              </div>

              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Processing..." : editingId ? "Update" : "Create"}
              </button>
              {editingId && <button type="button" onClick={() => {setEditingId(null); setForm(getInitialForm());}}>Cancel</button>}
            </form>
          </article>
        )}

        <article className="products-panel">
          <div className="filters-row">
            <input placeholder="Search products..." onChange={(e) => setSearch(e.target.value)} />
            <select onChange={(e) => setCarbonFilter(e.target.value)}>
              {CARBON_FILTERS.map(f => <option key={f} value={f}>{f} carbon</option>)}
            </select>
          </div>

          {apiError && <p className="error">{apiError}</p>}
          
          <div className="product-grid">
            {loading ? <p>Loading Products...</p> : filteredProducts.map((p) => {
              const rating = getEcoRating(p.carbonData?.totalCO2ePerKg || 0);
              return (
                <div key={p.id} className="product-card">
                  {/* Clicking the image or name now takes user to details via navigate */}
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    onClick={() => navigate(`/products/${p.id}`)} 
                    style={{ cursor: 'pointer' }} 
                  />
                  <div className="product-body">
                    <h3 
                      onClick={() => navigate(`/products/${p.id}`)} 
                      style={{ cursor: 'pointer' }}
                    >
                      {p.name} <span className={`badge badge-${rating.tone}`}>{rating.label}</span>
                    </h3>
                    <p className="price">${p.price}</p>
                    <div className="card-actions">
                      {isAdmin ? (
                        <>
                          <button onClick={() => onEdit(p)}>Edit</button>
                          <button className="danger" onClick={() => onDelete(p.id)}>Delete</button>
                        </>
                      ) : (
                        <>
                          <button className="primary-btn">Buy Now</button>
                          <button 
                            className="ghost-btn" 
                            onClick={() => navigate(`/products/${p.id}`)}
                          >
                            View Impact
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
=======
  const onEdit = (product) => {
    const carbonData = product?.carbonData || {};
    const carbonMethod = carbonData.method === "auto" ? "auto" : "manual";

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
      carbonMethod,
      manualCO2e:
        carbonMethod === "manual"
          ? String(carbonData.totalCO2ePerKg || "")
          : "",
      material: carbonData.material || "mixed",
      weightKg: "1",
      transportKm: "120",
      packagingType: "recyclable"
    });
    setFormError("");
    setCarbonPreview(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (productId) => {
    try {
      setDeletingId(productId);
      setApiError("");
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      if (editingId === productId) resetForm();
    } catch (error) {
      setApiError(error.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
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
            <div className="actions-row">
              <input type="file" accept="image/*" onChange={onImageFileChange} />
              <button
                type="button"
                className="ghost-btn"
                disabled={uploadingImage}
                onClick={onUploadImage}
              >
                {uploadingImage ? "Uploading..." : "Upload via Cloudinary"}
              </button>
            </div>

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

            {formError && <p className="error-line">{formError}</p>}
            {apiError && <p className="error-line">{apiError}</p>}

            <div className="actions-row">
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Product"
                    : "Add Product"}
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
            <p>{loading ? "Loading..." : `${filteredProducts.length} items visible`}</p>
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
            {apiError && !filteredProducts.length && (
              <p className="error-line">{apiError}</p>
            )}
            {filteredProducts.map((product) => {
              const totalCO2ePerKg = Number(product?.carbonData?.totalCO2ePerKg || 0);
              const rating = getEcoRating(totalCO2ePerKg);
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
                        <strong>${Number(product.price || 0).toFixed(2)}</strong>
                      </p>
                      <p>{totalCO2ePerKg} CO2e/kg</p>
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
                        disabled={deletingId === product.id}
                        onClick={() => onDelete(product.id)}
                      >
                        {deletingId === product.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4
              );
            })}
          </div>
        </article>
      </section>
    </main>
  );
}

<<<<<<< HEAD
export default ProductCatalog;
=======
export default ProductCatalog;
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4

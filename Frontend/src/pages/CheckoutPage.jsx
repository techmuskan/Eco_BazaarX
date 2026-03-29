import { useCallback, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import BackButton from "../components/BackButton";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { placeOrderApi } from "../services/orderService";
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from "../services/addressService";
import { getCartPathForRole, getOrderSuccessPathForRole } from "../utils/roleAccess";
import "../styles/CartCheckout.css";

const round = (value) => Math.round(value * 100) / 100;
const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", description: "Available now", available: true },
  { id: "card", label: "Credit / Debit Card", description: "Coming soon", available: false },
  { id: "upi", label: "UPI", description: "Coming soon", available: false },
];

function CheckoutPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { items = [], subtotal = 0, clearCart } = useCart() || {};

  // ======================== STATE MANAGEMENT ========================
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [processing, setProcessing] = useState(false);

  const [newAddrForm, setNewAddrForm] = useState({
    fullName: "", street: "", city: "", state: "", zipCode: ""
  });

  // ======================== CALCULATIONS ========================
  // ======================== FIXED CARBON CALCULATION ========================
  const totalCarbon = useMemo(() => {
    return items.reduce((acc, item) => {
      const lineEmission =
        item.emission ||
        item.totalCO2ePerKg ||
        item.carbonData?.totalCO2ePerKg ||
        0;

      return acc + lineEmission;
    }, 0);
  }, [items]);

  const shipping = useMemo(() => (subtotal >= 500 ? 0 : 40), [subtotal]);
  const totalAmount = useMemo(() => round(subtotal + shipping), [subtotal, shipping]);

  // ======================== EFFECTS ========================
  const loadAddresses = useCallback(async () => {
    try {
      setLoadingAddresses(true);
      const data = await fetchAddresses();
      setAddresses(data);
      if (data.length > 0 && !selectedAddressId) {
        setSelectedAddressId(data[0].id);
      }
    } catch (err) {
      showToast("Failed to load addresses", "error");
    } finally {
      setLoadingAddresses(false);
    }
  }, [selectedAddressId, showToast]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // ======================== ADDRESS ACTIONS ========================
  const handleDeleteAddress = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this address?")) return;

    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      if (selectedAddressId === id) setSelectedAddressId(null);
      showToast("Address removed", "success");
    } catch (err) {
      showToast("Could not delete address", "error");
    }
  };

  const handleEditClick = (addr) => {
    setNewAddrForm({
      fullName: addr.fullName,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode
    });
    setEditingAddressId(addr.id);
    setIsAddingNew(true);
  };

  const handleSaveAddress = async () => {
    if (!newAddrForm.fullName || !newAddrForm.street || !newAddrForm.city) {
      return showToast("Please fill in the required fields", "error");
    }

    try {
      const savedAddr = editingAddressId
        ? await updateAddress(editingAddressId, newAddrForm)
        : await createAddress(newAddrForm);

      showToast(editingAddressId ? "Address Updated" : "Address Saved", "success");
      setEditingAddressId(null);
      setIsAddingNew(false);
      setNewAddrForm({ fullName: "", street: "", city: "", state: "", zipCode: "" });
      await loadAddresses();
      setSelectedAddressId(savedAddr.id);
      setActiveStep(2); // Auto-advance after saving
    } catch (err) {
      showToast("Failed to save address", "error");
    }
  };

  // ======================== FINAL ORDER ========================
  const handlePlaceOrder = async () => {
    if (!selectedAddressId && !isAddingNew) {
      return showToast("Please select or add an address", "error");
    }

    if (paymentMethod !== "cod") {
      return showToast("Card and UPI payments will be available soon. Please use Cash on Delivery for now.", "info");
    }

    setProcessing(true);
    try {
      const selectedAddr = addresses.find(a => a.id === selectedAddressId);
      
      const payload = {
        fullName: selectedAddr?.fullName || newAddrForm.fullName,
        paymentMethod,
        addressId: isAddingNew ? null : selectedAddressId,
        newAddress: isAddingNew ? newAddrForm : null,
        items,
        subtotal,
        shipping,
        totalAmount,
        totalEmission: totalCarbon 
      };

      const order = await placeOrderApi(payload);
      clearCart?.();
      showToast("Order placed successfully!", "success");
      
      navigate(getOrderSuccessPathForRole(), {
        state: { order } 
      });
    } catch (err) {
      showToast(err.message || "Failed to place order", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <MainNavbar />
      <div className="checkout-bg">
        <div className="checkout-container">
          <BackButton fallbackTo={getCartPathForRole()} label="Back" className="checkout-back-button" />
          
          <div className="checkout-left">
            {/* Step 1: Address Selection */}
            <div className={`checkout-step ${activeStep === 1 ? 'active-panel' : ''}`}>
              <header className="step-header" onClick={() => setActiveStep(1)}>
                <span className="step-num">1</span>
                <h2>DELIVERY ADDRESS</h2>
              </header>

              {activeStep === 1 && (
                <div className="step-content">
                  {loadingAddresses ? (
                    <div className="address-list">
                      <p>Loading saved addresses...</p>
                    </div>
                  ) : !isAddingNew ? (
                    <div className="address-list">
                      {addresses.map((addr) => (
                        <label key={addr.id} className={`addr-item ${selectedAddressId === addr.id ? 'selected' : ''}`}>
                          <div className="radio-container">
                            <input
                              type="radio"
                              name="addr"
                              checked={selectedAddressId === addr.id}
                              onChange={() => setSelectedAddressId(addr.id)}
                            />
                          </div>
                          <div className="addr-details">
                            <div className="addr-name-row">
                              <strong>{addr.fullName}</strong>
                              <span className="addr-type">HOME</span>
                              <div className="addr-actions">
                                <button className="edit-btn" onClick={() => handleEditClick(addr)}>EDIT</button>
                                <button className="delete-btn" onClick={(e) => handleDeleteAddress(e, addr.id)}>REMOVE</button>
                              </div>
                            </div>
                            <p>{addr.street}, {addr.city}, {addr.state} - <strong>{addr.zipCode}</strong></p>
                            {selectedAddressId === addr.id && (
                              <button className="deliver-here-btn" onClick={() => setActiveStep(2)}>
                                DELIVER HERE
                              </button>
                            )}
                          </div>
                        </label>
                      ))}
                      <button className="add-new-trigger" onClick={() => { setEditingAddressId(null); setIsAddingNew(true); }}>
                        + Add a new address
                      </button>
                    </div>
                  ) : (
                    <div className="new-address-form">
                      <h3 className="form-title">{editingAddressId ? "Edit Address" : "Add New Address"}</h3>
                      <div className="form-grid">
                        <input placeholder="Full Name" value={newAddrForm.fullName} onChange={(e) => setNewAddrForm({ ...newAddrForm, fullName: e.target.value })} />
                        <input placeholder="Street Address" value={newAddrForm.street} onChange={(e) => setNewAddrForm({ ...newAddrForm, street: e.target.value })} />
                        <input placeholder="City" value={newAddrForm.city} onChange={(e) => setNewAddrForm({ ...newAddrForm, city: e.target.value })} />
                        <input placeholder="State" value={newAddrForm.state} onChange={(e) => setNewAddrForm({ ...newAddrForm, state: e.target.value })} />
                        <input placeholder="Zip Code" value={newAddrForm.zipCode} onChange={(e) => setNewAddrForm({ ...newAddrForm, zipCode: e.target.value })} />
                      </div>
                      <div className="form-actions">
                        <button className="primary-btn save-btn" onClick={handleSaveAddress}>
                          {editingAddressId ? "UPDATE ADDRESS" : "SAVE AND DELIVER HERE"}
                        </button>
                        <button className="cancel-btn" onClick={() => { setIsAddingNew(false); setEditingAddressId(null); }}>CANCEL</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Order Review */}
            <div className={`checkout-step ${activeStep === 2 ? 'active-panel' : ''}`}>
              <header className="step-header" onClick={() => selectedAddressId && setActiveStep(2)}>
                <span className="step-num">2</span>
                <h2>ORDER SUMMARY</h2>
              </header>
              {activeStep === 2 && (
                <div className="step-content">
                  <div className="mini-cart">
                    {items.map(item => (
                      <div key={item.itemId || item.productId} className="mini-item">
                        <img src={item.image || "https://via.placeholder.com/150?text=No+Image"} alt={item.productName} />
                        <div className="mini-details">
                          <h4>{item.productName}</h4>
                          <p className="mini-price">₹{Number(item.subtotal ?? item.price ?? 0).toFixed(2)} ({item.quantity} qty)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="continue-btn" onClick={() => setActiveStep(3)}>CONTINUE</button>
                </div>
              )}
            </div>

            {/* Step 3: Payment Selection */}
            <div className={`checkout-step ${activeStep === 3 ? 'active-panel' : ''}`}>
              <header className="step-header" onClick={() => activeStep > 2 && setActiveStep(3)}>
                <span className="step-num">3</span>
                <h2>PAYMENT OPTIONS</h2>
              </header>
              {activeStep === 3 && (
                <div className="step-content">
                  <div className="payment-options">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`pay-option ${paymentMethod === method.id ? 'selected' : ''} ${!method.available ? 'coming-soon' : ''}`}
                      >
                        <input 
                          type="radio" 
                          name="payment"
                          checked={paymentMethod === method.id}
                          disabled={!method.available}
                          onChange={() => setPaymentMethod(method.id)}
                        />
                        <div className="payment-copy">
                          <span className="payment-label">{method.label}</span>
                          <small>{method.description}</small>
                        </div>
                        {!method.available && <span className="soon-badge">Soon</span>}
                      </label>
                    ))}
                  </div>
                  {paymentMethod !== "cod" && (
                    <div className="payment-coming-soon-note">
                      Secure Card and UPI checkout is in progress and will be available in an upcoming release.
                    </div>
                  )}
                  <button className="final-place-btn" onClick={handlePlaceOrder} disabled={processing}>
                    {processing ? "PROCESSING..." : "PLACE COD ORDER"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Totals */}
          <aside className="price-details-card">
            <div className="carbon-summary-box">
              <h4><i className="fa-solid fa-cloud"></i> Environmental Impact</h4>
              <div className="summary-row">
                <span>Total Carbon Footprint</span>
                <span className="carbon-value">{totalCarbon.toFixed(2)} kg CO2e</span>
              </div>
              <p className="eco-message">
                {totalCarbon < 5 ? "🌱 This is a low-impact cart!" : "Consider greener alternatives to lower this score."}
              </p>
            </div>

            <div className="summary-divider"></div>
            <h3 className="price-header">PRICE DETAILS</h3>
            <div className="price-content">
              <div className="price-row"><span>Price</span><span>₹{subtotal}</span></div>
              <div className="price-row">
                <span>Delivery</span>
                <span className={shipping === 0 ? "free" : ""}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              <hr />
              <div className="total-row"><span>Total Amount</span><span>₹{totalAmount}</span></div>
            </div>
          </aside>

        </div>
      </div>
    </>
  );
}

export default CheckoutPage;

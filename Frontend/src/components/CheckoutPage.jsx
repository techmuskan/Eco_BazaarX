import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import MainNavbar from "./MainNavbar";
import "../styles/CartCheckout.css";

function round(value) {
  return Math.round(value * 100) / 100;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { items, subtotal, totalEmission, clearCart } = useCart();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
    paymentMethod: "cod"
  });
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const shipping = useMemo(() => (subtotal > 100 ? 0 : 7.5), [subtotal]);
  const total = useMemo(() => round(subtotal + shipping), [subtotal, shipping]);

  const onChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const onPlaceOrder = e => {
    e.preventDefault();
    if (!items.length) {
      setError("Your cart is empty.");
      showToast("Your cart is empty.", "error");
      return;
    }
    if (!form.fullName || !form.email || !form.address) {
      setError("Please complete all checkout fields.");
      showToast("Please complete all checkout fields.", "error");
      return;
    }

    setProcessing(true);
    window.setTimeout(() => {
      const orderId = `ECO-${Date.now().toString().slice(-8)}`;
      setConfirmation({
        orderId,
        customer: form.fullName,
        email: form.email,
        total,
        totalEmission,
        createdAt: new Date().toLocaleString()
      });
      clearCart();
      showToast("Order placed successfully.", "success");
      setProcessing(false);
    }, 800);
  };

  if (confirmation) {
    return (
      <main className="checkout-page">
        <MainNavbar />
        <section className="checkout-shell">
          <article className="card-panel confirmation-card">
            <p className="hero-kicker">Order Confirmed</p>
            <h1>Thank you for choosing greener shopping.</h1>
            <div className="confirm-grid">
              <p>
                <span>Order ID</span>
                <strong>{confirmation.orderId}</strong>
              </p>
              <p>
                <span>Customer</span>
                <strong>{confirmation.customer}</strong>
              </p>
              <p>
                <span>Email</span>
                <strong>{confirmation.email}</strong>
              </p>
              <p>
                <span>Total Paid</span>
                <strong>${confirmation.total.toFixed(2)}</strong>
              </p>
              <p>
                <span>Estimated CO2</span>
                <strong>{confirmation.totalEmission.toFixed(2)} kg CO2e</strong>
              </p>
              <p>
                <span>Placed At</span>
                <strong>{confirmation.createdAt}</strong>
              </p>
            </div>
            <div className="hero-actions">
              <button className="outline-btn" onClick={() => navigate("/products")}>
                Continue Shopping
              </button>
              <button className="primary-btn" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <MainNavbar />
      <section className="checkout-shell">
        <header className="checkout-hero">
          <div>
            <p className="hero-kicker">Smart Checkout</p>
            <h1>Review and Confirm</h1>
            <p>One last check on budget and emissions before placing your order.</p>
          </div>
          <div className="hero-actions">
            <Link className="outline-btn" to="/cart">
              Back to Cart
            </Link>
          </div>
        </header>

        <section className="checkout-grid">
          <article className="card-panel">
            <h2>Delivery & Payment</h2>
            <form className="checkout-form" onSubmit={onPlaceOrder}>
              <label>
                Full Name
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  placeholder="Enter your full name"
                />
                <small>Use your legal name for delivery verification.</small>
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="name@example.com"
                />
                <small>Order updates will be sent to this email.</small>
              </label>
              <label>
                Address
                <textarea
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  placeholder="Street, city, and postal code"
                />
                <small>Include landmark for faster delivery.</small>
              </label>
              <label>
                Payment Method
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={onChange}
                >
                  <option value="cod">Pay on Delivery (Recommended)</option>
                  <option value="card">Card Payment (UI only)</option>
                  <option value="upi">UPI (UI only)</option>
                </select>
              </label>

              {form.paymentMethod === "cod" && (
                <p className="cod-note">
                  Pay on Delivery selected: payment is collected at your address after
                  delivery.
                </p>
              )}

              {error && <p className="error-line">{error}</p>}

              <button className="primary-btn" disabled={processing || !items.length}>
                {processing ? "Placing order..." : "Place Order"}
              </button>
            </form>
          </article>

          <aside className="card-panel summary-panel">
            <h2>Order Snapshot</h2>
            <div className="summary-line">
              <span>Items</span>
              <strong>{items.length}</strong>
            </div>
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div className="summary-line">
              <span>Shipping</span>
              <strong>{shipping ? `$${shipping.toFixed(2)}` : "Free"}</strong>
            </div>
            <div className="summary-line">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <div className="summary-line">
              <span>Estimated CO2</span>
              <strong>{totalEmission.toFixed(2)} kg CO2e</strong>
            </div>
            <p className="cod-note">
              Default mode: Pay on Delivery. 
            </p>
          </aside>
        </section>
      </section>
    </main>
  );
}

export default CheckoutPage;

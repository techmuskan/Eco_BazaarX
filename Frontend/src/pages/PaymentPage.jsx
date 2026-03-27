import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainNavbar from "../components/MainNavbar";
import BackButton from "../components/BackButton";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../config/api";
import { getValidToken } from "../utils/authSession";
import { getCatalogPathForRole, getCheckoutPathForRole, getOrderSuccessPathForRole } from "../utils/roleAccess";
import "../styles/PaymentPage.css";

function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // orderId is usually what the backend needs for the URL
  const order = state?.order;

  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: ""
  });

  // Redirect if someone tries to access /payment directly without an order
  useEffect(() => {
    if (!order) {
      showToast("No active order session found", "error");
      navigate(getCatalogPathForRole("USER"));
      return;
    }

    if (order.paymentMethod === "card" || order.paymentMethod === "upi") {
      showToast("Card and UPI payments will be available soon.", "info");
    }
  }, [order, navigate, showToast]);

  if (!order) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isComingSoonFlow = order.paymentMethod === "card" || order.paymentMethod === "upi";

  const handlePayment = async (e) => {
    e.preventDefault();

    if (isComingSoonFlow) {
      showToast("This service will be available soon.", "info");
      return;
    }

    setProcessing(true);

    try {
      const token = getValidToken();
      
      // Match the backend endpoint you likely have
      // Using order.id or order.orderId depending on your DTO
      const response = await fetch(`${API_BASE_URL}/api/orders/pay/${order.id || order.orderId}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paymentMethod: order.paymentMethod,
          paymentDetails: formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment declined by bank");
      }

      showToast("Payment Successful! Your order is being processed.", "success");
      
      // Navigate to success page with order details
      navigate(getOrderSuccessPathForRole(), { state: { order } });
      
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-page-bg">
      <MainNavbar />
      <div className="payment-container">
        <BackButton fallbackTo={getCheckoutPathForRole()} label="Back" className="payment-back-button" />
        
        {/* LEFT: Payment Methods */}
        <div className="payment-left">
          <div className="payment-card-panel">
            <div className="panel-header">
              <span className="step-count">4</span>
              <h2>Payment Options</h2>
            </div>

            <div className="payment-content">
              <form onSubmit={handlePayment}>
                {order.paymentMethod === "card" && (
                  <div className="card-input-group">
                    <div className="coming-soon-panel">
                      <h3>Card Payments Arriving Soon</h3>
                      <p>
                        Secure card checkout is on the roadmap. For this release, please place
                        your order with Cash on Delivery.
                      </p>
                    </div>
                    <p className="input-label">Credit / Debit Card Details</p>
                    <input 
                      type="text" 
                      name="cardNumber"
                      placeholder="XXXX XXXX XXXX XXXX" 
                      disabled
                      maxLength="16"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                    />
                    <div className="form-row">
                      <input 
                        type="text" 
                        name="expiry"
                        placeholder="MM/YY" 
                        disabled
                        maxLength="5" 
                        value={formData.expiry}
                        onChange={handleInputChange}
                      />
                      <input 
                        type="password" 
                        name="cvv"
                        placeholder="CVV" 
                        disabled
                        maxLength="3" 
                        value={formData.cvv}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                {order.paymentMethod === "upi" && (
                  <div className="upi-input-group">
                    <div className="coming-soon-panel">
                      <h3>UPI Payments Arriving Soon</h3>
                      <p>
                        UPI checkout will be available in an upcoming release. For now, please
                        choose Cash on Delivery at checkout.
                      </p>
                    </div>
                    <p className="input-label">Your UPI ID</p>
                    <input 
                      type="text" 
                      name="upiId"
                      placeholder="username@bankid" 
                      disabled
                      value={formData.upiId}
                      onChange={handleInputChange}
                    />
                    <p className="helper-text">Pay using any UPI App (PhonePe, Google Pay, etc.)</p>
                  </div>
                )}

                {isComingSoonFlow ? (
                  <div className="coming-soon-actions">
                    <button type="button" className="pay-now-btn muted-btn" onClick={() => navigate(getCheckoutPathForRole())}>
                      Go Back to Checkout
                    </button>
                  </div>
                ) : (
                  <button type="submit" className="pay-now-btn" disabled={processing}>
                    {processing ? "PROCESSING..." : `PAY ₹${order.totalAmount.toLocaleString()}`}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT: Order Summary Sidebar */}
        <aside className="payment-sidebar">
          <div className="price-details">
            <h3>Order Summary</h3>
            <div className="price-row">
              <span>Order ID</span>
              <span>#{order.orderNumber || order.id}</span>
            </div>
            <div className="price-row">
              <span>Total Items</span>
              <span>{order.items?.length || 1}</span>
            </div>
            <hr />
            <div className="total-amount">
              <span>Total Payable</span>
              <span>₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="secure-badge">
            🛡️ Safe and Secure Payments. 100% Authentic products.
          </div>
        </aside>

      </div>
    </div>
  );
}

export default PaymentPage;

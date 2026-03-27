import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- for navigation
import MainNavbar from "../components/MainNavbar";
import BackButton from "../components/BackButton";
import { fetchOrdersApi } from "../services/orderService";
import { getDashboardPathForRole } from "../utils/roleAccess";
import "../styles/MyOrders.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchOrdersApi();
        setOrders(Array.isArray(data) ? data.reverse() : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleItemClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="orders-page-wrapper">
      <MainNavbar />
      <main className="orders-content">
        <BackButton fallbackTo={getDashboardPathForRole("USER")} label="Back" className="orders-back-button" />
        <h2 className="page-title">My Orders</h2>

        {loading ? (
          <div className="state-msg">
            <div className="loader"></div>
            <p>Fetching your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="state-msg empty-state">
            <img
              src="https://static.vecteezy.com/system/resources/thumbnails/005/006/007/small/no-item-in-the-shopping-cart-click-to-go-shopping-now-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg"
              alt="Empty Cart"
              className="empty-img"
            />
            <p>You have no orders yet.</p>
            <button className="shop-now-btn" onClick={() => window.location.href = '/products'}>
              Shop Now
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <section key={order.orderId || order._id} className="order-card">
                <header className="order-card-header">
                  <div className="order-id-group">
                    <span className="label">ORDER ID:</span>
                    <span className="id-value">
                      #{order.orderNumber || (order.orderId || order._id).slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className={`status-pill ${order.status?.toLowerCase() || "processing"}`}>
                    {order.status || "Processing"}
                  </div>
                </header>

                <div className="order-body">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="order-item-row clickable-item"
                      onClick={() => handleItemClick(item.productId)}
                    >
                      <div className="item-image">
                        <img
                          src={item.image || "https://via.placeholder.com/80?text=No+Image"}
                          alt={item.productName}
                          className="item-img"
                        />
                      </div>
                      <div className="item-details">
                        <p className="item-name">{item.productName}</p>
                        <p className="item-qty">Qty: {item.quantity}</p>
                        <p className="item-price">₹{item.price.toFixed(2)}</p>
                        <p className="item-subtotal">
                          Subtotal: ₹{item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="order-card-footer">
                  <div className="footer-summary">
                    <p>Shipping: ₹{order.shipping?.toFixed(2) || 0}</p>
                    <p><strong>Total: ₹{order.totalAmount?.toFixed(2)}</strong></p>
                  </div>
                  <div className="order-date">
                    Placed on: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}
                  </div>
                </footer>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyOrders;

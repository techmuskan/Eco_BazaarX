import { useEffect, useState } from "react";
import MainNavbar from "../components/MainNavbar";
import { fetchSellerOrders, updateSellerOrderStatus } from "../services/sellerService";
import "../styles/SellerDashboard.css";

function SellerOrders({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchSellerOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, nextStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateSellerOrderStatus(orderId, nextStatus);
      setOrders((prev) => prev.map((order) => (
        order.orderId === orderId ? updated : order
      )));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <>
      <MainNavbar onLogout={onLogout} />
      <div className="seller-dashboard">
        <section className="seller-hero">
          <div>
            <p className="seller-kicker">Seller Orders</p>
            <h1>Track every buyer order that includes your products.</h1>
            <p>See units sold, revenue, and the items attributed to your storefront.</p>
          </div>
        </section>

        <section className="seller-panel">
          <h2>Seller order stream</h2>
          {loading ? (
            <p className="seller-empty">Loading orders...</p>
          ) : orders.length > 0 ? (
            <div className="seller-order-list">
              {orders.map((order) => (
                <div className="seller-order-card" key={order.orderId}>
                  <div className="seller-order-head">
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <p>{order.customerName || "Customer"} · {new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`seller-status ${String(order.status || "Processing").toLowerCase()}`}>
                      {order.status || "Processing"}
                    </span>
                  </div>
                  <div className="seller-order-meta">
                    <span>{order.totalUnits} items</span>
                    <span>₹{Number(order.sellerRevenue || 0).toFixed(0)}</span>
                    <span>{Number(order.sellerEmission || 0).toFixed(2)} kg CO2e</span>
                  </div>
                  <div className="seller-fulfillment-row">
                    <span className={`seller-status ${String(order.sellerFulfillmentStatus || "PENDING").toLowerCase()}`}>
                      Seller: {order.sellerFulfillmentStatus || "PENDING"}
                    </span>
                    <select
                      value={order.sellerFulfillmentStatus || "PENDING"}
                      onChange={(event) => handleStatusChange(order.orderId, event.target.value)}
                      disabled={updatingOrderId === order.orderId}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PACKING">PACKING</option>
                      <option value="READY_TO_SHIP">READY TO SHIP</option>
                      <option value="SHIPPED">SHIPPED</option>
                    </select>
                  </div>
                  <div className="seller-order-items">
                    {(order.items || []).map((item, index) => (
                      <span key={`${order.orderId}-${index}`}>
                        {item.productName} x{item.quantity} · {item.fulfillmentStatus || "PENDING"}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="seller-empty">No orders yet. Once buyers purchase your products, they will appear here.</p>
          )}
        </section>
      </div>
    </>
  );
}

export default SellerOrders;

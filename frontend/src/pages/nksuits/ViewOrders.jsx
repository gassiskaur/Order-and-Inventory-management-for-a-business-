import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import StatusSelector from "../../components/StatusSelector";
import Button from "../../components/Button";
import * as nksuitsApi from "../../api/nksuitsApi";
import "./ViewOrders.css";

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const data = await nksuitsApi.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderNumber, newStatus) {
    try {
      await nksuitsApi.updateStatus(orderNumber, newStatus);
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeliver(orderNumber, isoDate) {
    try {
      await nksuitsApi.deliverOrder(orderNumber, isoDate);
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(orderNumber) {
    if (!window.confirm(`Delete order #${orderNumber}? This cannot be undone.`)) {
      return;
    }
    try {
      await nksuitsApi.deleteOrder(orderNumber);
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  const activeOrders = orders.filter((o) => o.Status !== "Delivered");
  const deliveredOrders = orders.filter((o) => o.Status === "Delivered");

  return (
    <Layout brand="nksuits" brandLabel="NK Suits Botique">
      <div className="content-frame section">
        <div className="orders-page__header">
          <div>
            <span className="eyebrow">Order Book</span>
            <h1 className="page-title" style={{ fontSize: "48px", marginTop: "8px" }}>
              Orders
            </h1>
          </div>
          <Link to="/nksuits/orders/new">
            <Button>New Order</Button>
          </Link>
        </div>

        {error && <p className="orders-page__error">{error}</p>}

        {loading ? (
          <p className="muted-text">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="muted-text">No orders yet. Create the first one.</p>
        ) : (
          <>
            <section className="orders-page__group">
              <h2 className="section-title orders-page__group-title">Active</h2>
              {activeOrders.length === 0 ? (
                <p className="muted-text">No active orders.</p>
              ) : (
                activeOrders.map((order) => (
                  <OrderRow
                    key={order.order_number}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onDeliver={handleDeliver}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </section>

            {deliveredOrders.length > 0 && (
              <section className="orders-page__group">
                <h2 className="section-title orders-page__group-title">Delivered</h2>
                {deliveredOrders.map((order) => (
                  <OrderRow
                    key={order.order_number}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onDeliver={handleDeliver}
                    onDelete={handleDelete}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

function OrderRow({ order, onStatusChange, onDeliver, onDelete }) {
  return (
    <Card className="order-row">
      <div className="order-row__main">
        <Link to={`/nksuits/orders/${order.order_number}`} className="order-row__link">
          <span className="metadata">#{order.order_number}</span>
          <h3 className="order-row__name">{order.Name}</h3>
        </Link>
        <div className="order-row__meta">
          <span className="muted-text body-text">{order.Type}</span>
          <span className="muted-text body-text">
            {order.Status === "Delivered"
              ? `Delivered ${order["Delivery date"] || "—"}`
              : `Created ${new Date(order["Date created"]).toLocaleDateString()}`}
          </span>
          <span className="muted-text body-text">
            ₹{order["sale price"]} <span className="order-row__struck">₹{order["Actual price"]}</span>
          </span>
        </div>
      </div>
      <div className="order-row__actions">
        <StatusSelector
          status={order.Status}
          deliveryDate={order["Delivery date"]}
          onChangeStatus={(status) => onStatusChange(order.order_number, status)}
          onDeliver={(isoDate) => onDeliver(order.order_number, isoDate)}
        />
        <Button variant="link" onClick={() => onDelete(order.order_number)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}

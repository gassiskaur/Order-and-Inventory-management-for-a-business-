import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import StatusSelector from "../../components/StatusSelector";
import CalendarPopup from "../../components/CalendarPopup";
import Button from "../../components/Button";
import * as nksuitsApi from "../../api/nksuitsApi";
import "./OrderDetail.css";

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [dispatchCalendarOpen, setDispatchCalendarOpen] = useState(false);

  async function loadOrder() {
    try {
      const data = await nksuitsApi.getOrder(Number(orderNumber));
      setOrder(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  async function handleStatusChange(newStatus) {
    try {
      await nksuitsApi.updateStatus(order.order_number, newStatus);
      loadOrder();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeliver(isoDate) {
    try {
      await nksuitsApi.deliverOrder(order.order_number, isoDate);
      loadOrder();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDispatchDateSelect(isoDate) {
    setDispatchCalendarOpen(false);
    try {
      await nksuitsApi.setDispatchDate(order.order_number, isoDate);
      loadOrder();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete order #${order.order_number}? This cannot be undone.`)) {
      return;
    }
    try {
      await nksuitsApi.deleteOrder(order.order_number);
      navigate("/nksuits/orders");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return (
      <Layout brand="nksuits" brandLabel="NK Suits Botique">
        <div className="content-frame section">
          <p className="form-error">{error}</p>
          <Link to="/nksuits/orders">← Back to orders</Link>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout brand="nksuits" brandLabel="NK Suits Botique">
        <div className="content-frame section">
          <p className="muted-text">Loading…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout brand="nksuits" brandLabel="NK Suits Botique">
      <div className="content-frame section order-detail">
        <Link to="/nksuits/orders" className="order-detail__back">← Back to orders</Link>

        <div className="order-detail__header">
          <div>
            <span className="metadata">Order #{order.order_number}</span>
            <h1 className="page-title" style={{ fontSize: "44px", marginTop: "8px" }}>
              {order.Name}
            </h1>
          </div>
          <StatusSelector
            status={order.Status}
            deliveryDate={order["Delivery date"]}
            onChangeStatus={handleStatusChange}
            onDeliver={handleDeliver}
          />
        </div>

        <hr className="divider-strong" style={{ margin: "32px 0" }} />

        <div className="grid-12">
          <div style={{ gridColumn: "1 / span 6" }} className="order-detail__field">
            <span className="metadata">Contact</span>
            <p className="body-text">{order.Contact}</p>
          </div>
          <div style={{ gridColumn: "7 / span 6" }} className="order-detail__field">
            <span className="metadata">Address</span>
            <p className="body-text">{order.Address}</p>
          </div>

          <div style={{ gridColumn: "1 / span 4" }} className="order-detail__field">
            <span className="metadata">Platform</span>
            <p className="body-text">
              {order.Platform === "Other" ? order["Platform other"] : order.Platform}
            </p>
          </div>
          <div style={{ gridColumn: "5 / span 4" }} className="order-detail__field">
            <span className="metadata">Type</span>
            <p className="body-text">{order.Type}</p>
          </div>
          <div style={{ gridColumn: "9 / span 4" }} className="order-detail__field">
            <span className="metadata">Date Created</span>
            <p className="body-text">
              {new Date(order["Date created"]).toLocaleString()}
            </p>
          </div>

          <div style={{ gridColumn: "1 / span 4" }} className="order-detail__field">
            <span className="metadata">Actual Price</span>
            <p className="body-text">₹{order["Actual price"]}</p>
          </div>
          <div style={{ gridColumn: "5 / span 4" }} className="order-detail__field">
            <span className="metadata">Sale Price</span>
            <p className="body-text">₹{order["sale price"]}</p>
          </div>
          <div style={{ gridColumn: "9 / span 4" }} className="order-detail__field">
            <span className="metadata">Discount Given</span>
            <p className="body-text">{order["discount given"].toFixed(1)}%</p>
          </div>

          <div style={{ gridColumn: "1 / span 6" }} className="order-detail__field">
            <span className="metadata">Dispatch Date</span>
            <p className="body-text">
              {order["Dispatch date"] || "Not set"}{" "}
              <Button variant="link" onClick={() => setDispatchCalendarOpen(true)}>
                {order["Dispatch date"] ? "Change" : "Set"}
              </Button>
            </p>
          </div>
          <div style={{ gridColumn: "7 / span 6" }} className="order-detail__field">
            <span className="metadata">Delivery Date</span>
            <p className="body-text">{order["Delivery date"] || "Not delivered yet"}</p>
          </div>

          {order.Remarks && (
            <div style={{ gridColumn: "1 / span 12" }} className="order-detail__field">
              <span className="metadata">Remarks</span>
              <p className="body-text">{order.Remarks}</p>
            </div>
          )}
        </div>

        {dispatchCalendarOpen && (
          <CalendarPopup
            value={order["Dispatch date"]}
            onSelect={handleDispatchDateSelect}
            onClose={() => setDispatchCalendarOpen(false)}
          />
        )}

        <hr className="divider" style={{ margin: "40px 0 24px" }} />

        {order.status_history && order.status_history.length > 0 && (
          <div className="order-detail__history">
            <span className="metadata">Status History</span>
            <ul>
              {order.status_history.map((entry, i) => (
                <li key={i} className="muted-text body-text">
                  {entry.status} — {new Date(entry.changed_on).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button variant="secondary" onClick={handleDelete} style={{ marginTop: "32px" }}>
          Delete Order
        </Button>
      </div>
    </Layout>
  );
}

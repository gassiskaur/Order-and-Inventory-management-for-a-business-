import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import { Input } from "../../components/Input";
import Button from "../../components/Button";
import * as suitstyleApi from "../../api/suitstyleApi";
import "./CustomerDetail.css";

export default function CustomerDetail() {
  const { contact } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const [orderForm, setOrderForm] = useState({ "Actual price": "", "sale price": "" });
  const [orderError, setOrderError] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  async function loadAll() {
    setError("");
    try {
      const [customerData, orderData] = await Promise.all([
        suitstyleApi.getCustomer(contact),
        suitstyleApi.getOrdersForCustomer(contact),
      ]);
      setCustomer(customerData);
      setOrders(orderData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

  async function handleAddOrder(event) {
    event.preventDefault();
    setOrderError("");
    setSubmittingOrder(true);
    try {
      await suitstyleApi.addOrder({
        Contact: contact,
        "Actual price": parseFloat(orderForm["Actual price"]),
        "sale price": parseFloat(orderForm["sale price"]),
      });
      setOrderForm({ "Actual price": "", "sale price": "" });
      loadAll();
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setSubmittingOrder(false);
    }
  }

  async function handleDeleteOrder(orderNumber) {
    if (!window.confirm(`Delete order #${orderNumber}?`)) return;
    try {
      await suitstyleApi.deleteOrder(contact, orderNumber);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCustomer() {
    if (
      !window.confirm(
        `Delete customer "${customer.Name}"? Their order history will remain but will no longer be linked from the customer list.`
      )
    ) {
      return;
    }
    try {
      await suitstyleApi.deleteCustomer(contact);
      navigate("/suitstyle/customers");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return (
      <Layout brand="suitstyle" brandLabel="Suit Style Store">
        <div className="content-frame section">
          <p className="form-error">{error}</p>
          <Link to="/suitstyle/customers">← Back to customers</Link>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout brand="suitstyle" brandLabel="Suit Style Store">
        <div className="content-frame section">
          <p className="muted-text">Loading…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout brand="suitstyle" brandLabel="Suit Style Store">
      <div className="content-frame section customer-detail">
        <Link to="/suitstyle/customers" className="order-detail__back">← Back to customers</Link>

        <div className="order-detail__header">
          <div>
            <span className="metadata">{customer.Contact}</span>
            <h1 className="page-title" style={{ fontSize: "44px", marginTop: "8px" }}>
              {customer.Name}
            </h1>
          </div>
        </div>

        <hr className="divider-strong" style={{ margin: "32px 0" }} />

        <div className="grid-12">
          <div style={{ gridColumn: "1 / span 6" }} className="order-detail__field">
            <span className="metadata">Address</span>
            <p className="body-text">{customer.Address}</p>
          </div>
          <div style={{ gridColumn: "7 / span 3" }} className="order-detail__field">
            <span className="metadata">Platform</span>
            <p className="body-text">
              {customer.Platform === "Other" ? customer["Platform other"] : customer.Platform}
            </p>
          </div>
          <div style={{ gridColumn: "10 / span 3" }} className="order-detail__field">
            <span className="metadata">Customer Since</span>
            <p className="body-text">
              {new Date(customer["Date created"]).toLocaleDateString()}
            </p>
          </div>
          {customer.Remarks && (
            <div style={{ gridColumn: "1 / span 12" }} className="order-detail__field">
              <span className="metadata">Remarks</span>
              <p className="body-text">{customer.Remarks}</p>
            </div>
          )}
        </div>

        <hr className="divider" style={{ margin: "40px 0" }} />

        <h2 className="section-title" style={{ marginBottom: "24px" }}>Order History</h2>

        {orders.length === 0 ? (
          <p className="muted-text" style={{ marginBottom: "40px" }}>No orders yet.</p>
        ) : (
          <div style={{ marginBottom: "48px" }}>
            {orders.map((order) => (
              <Card key={order.order_number} className="customer-order-row">
                <div>
                  <span className="metadata">Order #{order.order_number}</span>
                  <p className="body-text">
                    {new Date(order["Date created"]).toLocaleDateString()}
                  </p>
                </div>
                <div className="customer-order-row__prices">
                  <span className="body-text">
                    ₹{order["sale price"]}{" "}
                    <span className="order-row__struck">₹{order["Actual price"]}</span>
                  </span>
                  <span className="muted-text body-text">
                    {order["discount given"].toFixed(1)}% off
                  </span>
                </div>
                <Button variant="link" onClick={() => handleDeleteOrder(order.order_number)}>
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        )}

        <h2 className="section-title" style={{ marginBottom: "24px" }}>Add Order</h2>
        <form onSubmit={handleAddOrder} className="customer-detail__order-form">
          <Input
            id="actual-price"
            label="Actual price"
            type="number"
            step="0.01"
            min="0"
            value={orderForm["Actual price"]}
            onChange={(e) => setOrderForm((f) => ({ ...f, "Actual price": e.target.value }))}
            required
          />
          <Input
            id="sale-price"
            label="Sale price"
            type="number"
            step="0.01"
            min="0"
            value={orderForm["sale price"]}
            onChange={(e) => setOrderForm((f) => ({ ...f, "sale price": e.target.value }))}
            required
          />
          <Button type="submit" disabled={submittingOrder}>
            {submittingOrder ? "Saving…" : "Add Order"}
          </Button>
        </form>
        {orderError && <p className="form-error" style={{ marginTop: "16px" }}>{orderError}</p>}

        <hr className="divider" style={{ margin: "48px 0 24px" }} />

        <Button variant="secondary" onClick={handleDeleteCustomer}>
          Delete Customer
        </Button>
      </div>
    </Layout>
  );
}

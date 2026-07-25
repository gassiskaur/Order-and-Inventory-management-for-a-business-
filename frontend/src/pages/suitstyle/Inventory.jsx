import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import { Input, Select } from "../../components/Input";
import Button from "../../components/Button";
import * as suitstyleApi from "../../api/suitstyleApi";
import "./Inventory.css";

export default function Inventory() {
  const [vendors, setVendors] = useState([]);
  const [stock, setStock] = useState([]);
  const [error, setError] = useState("");

  const [vendorName, setVendorName] = useState("");
  const [vendorError, setVendorError] = useState("");
  const [addingVendor, setAddingVendor] = useState(false);

  const [stockForm, setStockForm] = useState({ vendor_name: "", "Cost of stock": "" });
  const [stockError, setStockError] = useState("");
  const [addingStock, setAddingStock] = useState(false);

  async function loadAll() {
    setError("");
    try {
      const [vendorData, stockData] = await Promise.all([
        suitstyleApi.getVendors(),
        suitstyleApi.getAllStock(),
      ]);
      setVendors(vendorData);
      setStock(stockData);
      if (vendorData.length && !stockForm.vendor_name) {
        setStockForm((f) => ({ ...f, vendor_name: vendorData[0].vendor_name }));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddVendor(event) {
    event.preventDefault();
    setVendorError("");
    setAddingVendor(true);
    try {
      await suitstyleApi.addVendor(vendorName);
      setVendorName("");
      loadAll();
    } catch (err) {
      setVendorError(err.message);
    } finally {
      setAddingVendor(false);
    }
  }

  async function handleAddStock(event) {
    event.preventDefault();
    setStockError("");
    setAddingStock(true);
    try {
      await suitstyleApi.addStock(stockForm.vendor_name, parseFloat(stockForm["Cost of stock"]));
      setStockForm((f) => ({ ...f, "Cost of stock": "" }));
      loadAll();
    } catch (err) {
      setStockError(err.message);
    } finally {
      setAddingStock(false);
    }
  }

  return (
    <Layout brand="suitstyle" brandLabel="Suit Style Store">
      <div className="content-frame section inventory-page">
        <span className="eyebrow">Supply</span>
        <h1 className="page-title" style={{ fontSize: "48px", marginTop: "8px", marginBottom: "56px" }}>
          Inventory
        </h1>

        {error && <p className="form-error">{error}</p>}

        <div className="grid-12 inventory-page__forms">
          <div style={{ gridColumn: "1 / span 6" }}>
            <h2 className="section-title" style={{ marginBottom: "20px" }}>Add Vendor</h2>
            <form onSubmit={handleAddVendor} className="inventory-page__inline-form">
              <Input
                id="vendor-name"
                label="Vendor name"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                required
              />
              <Button type="submit" disabled={addingVendor}>
                {addingVendor ? "Saving…" : "Add"}
              </Button>
            </form>
            {vendorError && <p className="form-error" style={{ marginTop: "12px" }}>{vendorError}</p>}
          </div>

          <div style={{ gridColumn: "7 / span 6" }}>
            <h2 className="section-title" style={{ marginBottom: "20px" }}>Log Stock Cost</h2>
            <form onSubmit={handleAddStock} className="inventory-page__inline-form">
              <Select
                id="stock-vendor"
                label="Vendor"
                value={stockForm.vendor_name}
                onChange={(e) => setStockForm((f) => ({ ...f, vendor_name: e.target.value }))}
                required
              >
                {vendors.map((v) => (
                  <option key={v.vendor_name} value={v.vendor_name}>{v.vendor_name}</option>
                ))}
              </Select>
              <Input
                id="stock-cost"
                label="Cost of stock"
                type="number"
                step="0.01"
                min="0"
                value={stockForm["Cost of stock"]}
                onChange={(e) => setStockForm((f) => ({ ...f, "Cost of stock": e.target.value }))}
                required
              />
              <Button type="submit" disabled={addingStock || vendors.length === 0}>
                {addingStock ? "Saving…" : "Log"}
              </Button>
            </form>
            {vendors.length === 0 && (
              <p className="muted-text" style={{ marginTop: "12px" }}>
                Add a vendor before logging stock.
              </p>
            )}
            {stockError && <p className="form-error" style={{ marginTop: "12px" }}>{stockError}</p>}
          </div>
        </div>

        <hr className="divider-strong" style={{ margin: "56px 0 32px" }} />

        <h2 className="section-title" style={{ marginBottom: "24px" }}>Stock Log</h2>
        {stock.length === 0 ? (
          <p className="muted-text">No stock entries yet.</p>
        ) : (
          stock.map((entry) => (
            <Card key={entry._id} className="stock-row">
              <span className="body-text">{entry.vendor_name}</span>
              <span className="muted-text body-text">
                {new Date(entry["Date created"]).toLocaleDateString()}
              </span>
              <span className="body-text">₹{entry["Cost of stock"]}</span>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}

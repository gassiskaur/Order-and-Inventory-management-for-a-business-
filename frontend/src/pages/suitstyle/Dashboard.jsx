import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Metric from "../../components/Metric";
import * as suitstyleApi from "../../api/suitstyleApi";
import "../nksuits/Dashboard.css";

const WINDOW_LABELS = {
  weekly: "This Week",
  monthly: "This Month",
  six_monthly: "Last 6 Months",
  yearly: "This Year",
};

export default function Dashboard() {
  const [summaries, setSummaries] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    suitstyleApi
      .getAnalytics()
      .then(setSummaries)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <Layout brand="suitstyle" brandLabel="Suit Style Store">
      <div className="content-frame section">
        <span className="eyebrow">Performance</span>
        <h1 className="page-title" style={{ fontSize: "48px", marginTop: "8px", marginBottom: "56px" }}>
          Dashboard
        </h1>

        {error && <p className="form-error">{error}</p>}

        {!summaries ? (
          <p className="muted-text">Loading…</p>
        ) : (
          Object.entries(WINDOW_LABELS).map(([key, label]) => (
            <section key={key} className="dashboard-window">
              <h2 className="section-title dashboard-window__title">{label}</h2>
              <div className="grid-12 dashboard-window__metrics">
                <div style={{ gridColumn: "1 / span 3" }}>
                  <Metric label="Orders" value={summaries[key].order_count} />
                </div>
                <div style={{ gridColumn: "4 / span 3" }}>
                  <Metric label="New Customers" value={summaries[key].new_customer_count} accent />
                </div>
                <div style={{ gridColumn: "7 / span 3" }}>
                  <Metric
                    label="Sale Value"
                    value={`₹${summaries[key].total_sale_price.toLocaleString()}`}
                  />
                </div>
                <div style={{ gridColumn: "10 / span 3" }}>
                  <Metric
                    label="Stock Cost"
                    value={`₹${summaries[key].total_stock_cost.toLocaleString()}`}
                  />
                </div>
              </div>
            </section>
          ))
        )}
      </div>
    </Layout>
  );
}

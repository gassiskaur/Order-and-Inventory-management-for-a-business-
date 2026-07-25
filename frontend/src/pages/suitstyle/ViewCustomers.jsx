import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import { Input } from "../../components/Input";
import Button from "../../components/Button";
import * as suitstyleApi from "../../api/suitstyleApi";
import "./ViewCustomers.css";

export default function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCustomers(q) {
    setLoading(true);
    setError("");
    try {
      const data = await suitstyleApi.getCustomers(q);
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function handleSearchSubmit(event) {
    event.preventDefault();
    loadCustomers(query);
  }

  return (
    <Layout brand="suitstyle" brandLabel="Suit Style Store">
      <div className="content-frame section">
        <div className="customers-page__header">
          <div>
            <span className="eyebrow">Client Book</span>
            <h1 className="page-title" style={{ fontSize: "48px", marginTop: "8px" }}>
              Customers
            </h1>
          </div>
          <Link to="/suitstyle/customers/new">
            <Button>New Customer</Button>
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} className="customers-page__search">
          <Input
            id="search"
            placeholder="Search by name or contact…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="secondary" type="submit">Search</Button>
        </form>

        {error && <p className="form-error">{error}</p>}

        {loading ? (
          <p className="muted-text">Loading customers…</p>
        ) : customers.length === 0 ? (
          <p className="muted-text">No customers found.</p>
        ) : (
          customers.map((customer) => (
            <Card key={customer.Contact} className="customer-row">
              <Link to={`/suitstyle/customers/${encodeURIComponent(customer.Contact)}`} className="customer-row__link">
                <h3 className="customer-row__name">{customer.Name}</h3>
                <div className="customer-row__meta">
                  <span className="muted-text body-text">{customer.Contact}</span>
                  <span className="muted-text body-text">{customer.Platform}</span>
                </div>
              </Link>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}

import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Button from "../components/Button";
import "./Home.css";

export default function Home() {
  const { logout } = useAuth();

  return (
    <div className="app-shell">
      <div className="editorial-gridlines" aria-hidden="true">
        {Array.from({ length: 13 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="content-frame home-page">
        <div className="home-page__top">
          <span className="eyebrow">Atelier Operations</span>
          <Button variant="link" onClick={logout}>
            Log Out
          </Button>
        </div>

        <h1 className="page-title home-page__title">
          Two houses,
          <br />
          <em>one atelier</em>
        </h1>

        <div className="grid-12 home-page__brands">
          <Link to="/nksuits/orders" className="brand-tile" style={{ gridColumn: "1 / span 6" }}>
            <span className="metadata">House 01</span>
            <h2 className="section-title">NK Suits Botique</h2>
            <p className="muted-text body-text">
              Order intake, dispatch tracking, and delivery for made and
              ready-made pieces.
            </p>
            <span className="brand-tile__enter">Enter →</span>
          </Link>

          <Link
            to="/suitstyle/customers"
            className="brand-tile"
            style={{ gridColumn: "7 / span 6" }}
          >
            <span className="metadata">House 02</span>
            <h2 className="section-title">Suit Style Store</h2>
            <p className="muted-text body-text">
              Customer relationships, order history, and vendor stock in
              one place.
            </p>
            <span className="brand-tile__enter">Enter →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

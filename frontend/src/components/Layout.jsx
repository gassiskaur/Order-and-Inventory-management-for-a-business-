import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Button from "./Button";
import "./Layout.css";

function GridLines() {
  return (
    <div className="editorial-gridlines" aria-hidden="true">
      {Array.from({ length: 13 }).map((_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

/**
 * brand: "nksuits" | "suitstyle" | null — controls which nav links show.
 * brandLabel: display name shown in the header.
 */
export default function Layout({ brand, brandLabel, children }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const navLinks =
    brand === "nksuits"
      ? [
          { to: "/nksuits/orders", label: "Orders" },
          { to: "/nksuits/orders/new", label: "New Order" },
          { to: "/nksuits/dashboard", label: "Dashboard" },
        ]
      : brand === "suitstyle"
      ? [
          { to: "/suitstyle/customers", label: "Customers" },
          { to: "/suitstyle/customers/new", label: "New Customer" },
          { to: "/suitstyle/inventory", label: "Inventory" },
          { to: "/suitstyle/dashboard", label: "Dashboard" },
        ]
      : [];

  return (
    <div className="app-shell">
      <GridLines />
      <header className="site-header">
        <div className="content-frame site-header__inner">
          <Link to="/" className="site-header__brand">
            {brandLabel || "Boutique App"}
          </Link>
          <nav className="site-header__nav">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="site-header__link">
                {link.label}
              </Link>
            ))}
            <Link to="/" className="site-header__link">
              Switch Brand
            </Link>
            <Button variant="link" onClick={handleLogout}>
              Log Out
            </Button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

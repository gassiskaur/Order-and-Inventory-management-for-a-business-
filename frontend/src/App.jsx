import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

import Login from "./pages/Login";
import Home from "./pages/Home";

import NksuitsViewOrders from "./pages/nksuits/ViewOrders";
import NksuitsCreateOrder from "./pages/nksuits/CreateOrder";
import NksuitsOrderDetail from "./pages/nksuits/OrderDetail";
import NksuitsDashboard from "./pages/nksuits/Dashboard";

import SuitstyleViewCustomers from "./pages/suitstyle/ViewCustomers";
import SuitstyleAddCustomer from "./pages/suitstyle/AddCustomer";
import SuitstyleCustomerDetail from "./pages/suitstyle/CustomerDetail";
import SuitstyleInventory from "./pages/suitstyle/Inventory";
import SuitstyleDashboard from "./pages/suitstyle/Dashboard";

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />

      {/* NK Suits Botique */}
      <Route
        path="/nksuits/orders"
        element={<RequireAuth><NksuitsViewOrders /></RequireAuth>}
      />
      <Route
        path="/nksuits/orders/new"
        element={<RequireAuth><NksuitsCreateOrder /></RequireAuth>}
      />
      <Route
        path="/nksuits/orders/:orderNumber"
        element={<RequireAuth><NksuitsOrderDetail /></RequireAuth>}
      />
      <Route
        path="/nksuits/dashboard"
        element={<RequireAuth><NksuitsDashboard /></RequireAuth>}
      />

      {/* Suit Style Store */}
      <Route
        path="/suitstyle/customers"
        element={<RequireAuth><SuitstyleViewCustomers /></RequireAuth>}
      />
      <Route
        path="/suitstyle/customers/new"
        element={<RequireAuth><SuitstyleAddCustomer /></RequireAuth>}
      />
      <Route
        path="/suitstyle/customers/:contact"
        element={<RequireAuth><SuitstyleCustomerDetail /></RequireAuth>}
      />
      <Route
        path="/suitstyle/inventory"
        element={<RequireAuth><SuitstyleInventory /></RequireAuth>}
      />
      <Route
        path="/suitstyle/dashboard"
        element={<RequireAuth><SuitstyleDashboard /></RequireAuth>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

import { apiRequest } from "./client";

export function getCustomers(query) {
  const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
  return apiRequest(`/api/suitstyle/customers${suffix}`);
}

export function getCustomer(contact) {
  return apiRequest(`/api/suitstyle/customers/${encodeURIComponent(contact)}`);
}

export function createCustomer(customer) {
  return apiRequest("/api/suitstyle/customers", { method: "POST", body: customer });
}

export function updateCustomer(contact, fields) {
  return apiRequest(`/api/suitstyle/customers/${encodeURIComponent(contact)}`, {
    method: "PATCH",
    body: fields,
  });
}

export function deleteCustomer(contact) {
  return apiRequest(`/api/suitstyle/customers/${encodeURIComponent(contact)}`, {
    method: "DELETE",
  });
}

export function getOrdersForCustomer(contact) {
  return apiRequest(`/api/suitstyle/customers/${encodeURIComponent(contact)}/orders`);
}

export function addOrder(order) {
  return apiRequest("/api/suitstyle/orders", { method: "POST", body: order });
}

export function deleteOrder(contact, orderNumber) {
  return apiRequest(
    `/api/suitstyle/customers/${encodeURIComponent(contact)}/orders/${orderNumber}`,
    { method: "DELETE" }
  );
}

export function getVendors() {
  return apiRequest("/api/suitstyle/vendors");
}

export function addVendor(vendorName) {
  return apiRequest("/api/suitstyle/vendors", {
    method: "POST",
    body: { vendor_name: vendorName },
  });
}

export function getAllStock() {
  return apiRequest("/api/suitstyle/stock");
}

export function getStockForVendor(vendorName) {
  return apiRequest(`/api/suitstyle/vendors/${encodeURIComponent(vendorName)}/stock`);
}

export function addStock(vendorName, costOfStock) {
  return apiRequest("/api/suitstyle/stock", {
    method: "POST",
    body: { vendor_name: vendorName, "Cost of stock": costOfStock },
  });
}

export function getAnalytics() {
  return apiRequest("/api/suitstyle/analytics");
}

export function getOptions() {
  return apiRequest("/api/suitstyle/options");
}

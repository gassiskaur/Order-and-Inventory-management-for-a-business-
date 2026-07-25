import { apiRequest } from "./client";

export function getOrders() {
  return apiRequest("/api/nksuits/orders");
}

export function getOrder(orderNumber) {
  return apiRequest(`/api/nksuits/orders/${orderNumber}`);
}

export function createOrder(order) {
  return apiRequest("/api/nksuits/orders", { method: "POST", body: order });
}

export function updateStatus(orderNumber, status) {
  return apiRequest(`/api/nksuits/orders/${orderNumber}/status`, {
    method: "PATCH",
    body: { Status: status },
  });
}

export function setDispatchDate(orderNumber, dispatchDate) {
  return apiRequest(`/api/nksuits/orders/${orderNumber}/dispatch-date`, {
    method: "PATCH",
    body: { "Dispatch date": dispatchDate },
  });
}

export function deliverOrder(orderNumber, deliveryDate) {
  return apiRequest(`/api/nksuits/orders/${orderNumber}/deliver`, {
    method: "PATCH",
    body: { "Delivery date": deliveryDate },
  });
}

export function deleteOrder(orderNumber) {
  return apiRequest(`/api/nksuits/orders/${orderNumber}`, { method: "DELETE" });
}

export function getAnalytics() {
  return apiRequest("/api/nksuits/analytics");
}

export function getOptions() {
  return apiRequest("/api/nksuits/options");
}

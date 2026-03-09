const BASE = "http://localhost:8000";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}
async function post(path, body = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}
async function patch(path) {
  const res = await fetch(`${BASE}${path}`, { method: "PATCH" });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}
async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// ── Predictions ───────────────────────────────────────────────────────────────

// save=false → no DB write (used by Dashboard load, Compare, TopCrops)
// save=true  → saves to MongoDB (used when user clicks Predict button)
export const quickPredict = (crop, state, save = false) =>
  get(
    `/predict/quick?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}&save=${save}`,
  );

export const fullPredict = (crop, state, month, year) =>
  post("/predict", { crop, state, month, year });

export const getForecast = (crop, state, months = 6) =>
  get(
    `/forecast?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}&months=${months}`,
  );

// ── Saved History (MongoDB) ───────────────────────────────────────────────────
export async function getPredictionHistory({
  crop,
  state,
  status,
  limit = 50,
  skip = 0,
} = {}) {
  const p = new URLSearchParams();
  if (crop && crop !== "All Crops") p.append("crop", crop);
  if (state && state !== "All") p.append("state", state);
  if (status && status !== "All") p.append("status", status);
  p.append("limit", limit);
  p.append("skip", skip);
  return get(`/predictions/history?${p}`);
}
export const getRecentPredictions = (limit = 5) =>
  get(`/predictions/recent?limit=${limit}`);
export const getPredictionStats = () => get("/predictions/stats");
export const updateActualPrice = (id, price) =>
  patch(`/predictions/${id}/actual?actual_price=${price}`);

// ── Price Alerts ──────────────────────────────────────────────────────────────
export const getAlerts = (activeOnly = false) =>
  get(`/alerts?active_only=${activeOnly}`);
export const createAlert = (crop, condition, threshold, note = "") =>
  post("/alerts", { crop, condition, threshold, note });
export const deleteAlert = (id) => del(`/alerts/${id}`);
export const toggleAlert = (id, active) =>
  patch(`/alerts/${id}/toggle?active=${active}`);

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications = (limit = 20) =>
  get(`/notifications?limit=${limit}`);
export const markAllRead = () => post("/notifications/mark-read");
export const clearNotifications = () => del("/notifications/clear");

// ── Prices ────────────────────────────────────────────────────────────────────
export const getDashboardPrices = () => get("/prices/dashboard");
export const getCurrentPrices = (commodity, state) =>
  get(
    `/prices/current${commodity ? `?commodity=${encodeURIComponent(commodity)}` : ""}${state ? `&state=${encodeURIComponent(state)}` : ""}`,
  );
export const getPriceHistory = (commodity, state, days = 180) =>
  get(
    `/prices/history?commodity=${encodeURIComponent(commodity)}&state=${encodeURIComponent(state)}&days=${days}`,
  );

// ── Meta ──────────────────────────────────────────────────────────────────────
export const getCrops = () => get("/crops");
export const getStates = () => get("/states");
export const checkHealth = () => get("/health");

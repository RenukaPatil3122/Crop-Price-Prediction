const BASE = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("agrisense_token") || null;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get(path, auth = false) {
  const res = await fetch(`${BASE}${path}`, {
    headers: auth ? authHeaders() : {},
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}
async function post(path, body = {}, auth = false) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}
async function patch(path, auth = false) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: auth ? authHeaders() : {},
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}
async function del(path, auth = false) {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: auth ? authHeaders() : {},
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// ── Predictions ───────────────────────────────────────────────────────────────

// save=false → no DB write (used by Dashboard load, Compare, TopCrops)
// save=true  → saves to MongoDB (used when user clicks Predict button)
export const quickPredict = (crop, state, save = false) =>
  get(
    `/predict/quick?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}&save=${save}`,
    true,
  );

export const fullPredict = (crop, state, month, year) =>
  post("/predict", { crop, state, month, year }, true);

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
  return get(`/predictions/history?${p}`, true); // ← auth
}
export const getRecentPredictions = (limit = 5) =>
  get(`/predictions/recent?limit=${Math.min(limit, 20)}`, true); // ← auth
export const getPredictionStats = () => get("/predictions/stats", true);
export const updateActualPrice = (id, price) =>
  patch(`/predictions/${id}/actual?actual_price=${price}`, true);

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

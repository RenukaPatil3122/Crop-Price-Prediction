// All backend calls go through here
// Backend runs on http://localhost:8000

const BASE = "http://localhost:8000";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function patch(path) {
  const res = await fetch(`${BASE}${path}`, { method: "PATCH" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── Predictions ───────────────────────────────────────────────────────────────

/** Quick predict for current month — auto-saved to MongoDB */
export async function quickPredict(crop, state) {
  return get(
    `/predict/quick?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}`,
  );
}

/** Full prediction with forecast — auto-saved to MongoDB */
export async function fullPredict(crop, state, month, year) {
  return post("/predict", { crop, state, month, year });
}

/** Forecast for next N months */
export async function getForecast(crop, state, months = 6) {
  return get(
    `/forecast?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}&months=${months}`,
  );
}

// ── Saved Prediction History (MongoDB) ───────────────────────────────────────

/**
 * Fetch saved predictions from MongoDB
 * @param {object} filters - { crop, state, status, limit, skip }
 */
export async function getPredictionHistory({
  crop,
  state,
  status,
  limit = 50,
  skip = 0,
} = {}) {
  const params = new URLSearchParams();
  if (crop && crop !== "All Crops") params.append("crop", crop);
  if (state && state !== "All") params.append("state", state);
  if (status && status !== "All") params.append("status", status);
  params.append("limit", limit);
  params.append("skip", skip);
  return get(`/predictions/history?${params.toString()}`);
}

/** 5 most recent predictions for Dashboard */
export async function getRecentPredictions(limit = 5) {
  return get(`/predictions/recent?limit=${limit}`);
}

/** Aggregate stats: total, verified, pending, avg_accuracy */
export async function getPredictionStats() {
  return get("/predictions/stats");
}

/** Admin: mark actual price + set status to Verified */
export async function updateActualPrice(predictionId, actualPrice) {
  return patch(
    `/predictions/${predictionId}/actual?actual_price=${actualPrice}`,
  );
}

// ── Prices ────────────────────────────────────────────────────────────────────

/** Dashboard summary — top 6 crops */
export async function getDashboardPrices() {
  return get("/prices/dashboard");
}

/** Current mandi prices */
export async function getCurrentPrices(commodity = null, state = null) {
  let url = "/prices/current";
  const p = [];
  if (commodity) p.push(`commodity=${encodeURIComponent(commodity)}`);
  if (state) p.push(`state=${encodeURIComponent(state)}`);
  if (p.length) url += "?" + p.join("&");
  return get(url);
}

/** Price history for a crop+state */
export async function getPriceHistory(commodity, state, days = 180) {
  return get(
    `/prices/history?commodity=${encodeURIComponent(commodity)}&state=${encodeURIComponent(state)}&days=${days}`,
  );
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function getCrops() {
  return get("/crops");
}
export async function getStates() {
  return get("/states");
}
export async function checkHealth() {
  return get("/health");
}

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

// ── Predictions ──────────────────────────────────────────────────────────────

/**
 * Quick predict for current month
 * GET /predict/quick?crop=Wheat&state=Punjab
 */
export async function quickPredict(crop, state) {
  return get(
    `/predict/quick?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}`,
  );
}

/**
 * Full prediction with forecast
 * POST /predict  { crop, state, month, year }
 */
export async function fullPredict(crop, state, month, year) {
  return post("/predict", { crop, state, month, year });
}

/**
 * Forecast for next N months
 * GET /forecast?crop=Wheat&state=Punjab&months=6
 */
export async function getForecast(crop, state, months = 6) {
  return get(
    `/forecast?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}&months=${months}`,
  );
}

// ── Prices ───────────────────────────────────────────────────────────────────

/**
 * Dashboard summary — top 6 crops
 * GET /prices/dashboard
 */
export async function getDashboardPrices() {
  return get("/prices/dashboard");
}

/**
 * Current mandi prices
 * GET /prices/current?commodity=Wheat&state=Punjab
 */
export async function getCurrentPrices(commodity = null, state = null) {
  let url = "/prices/current";
  const params = [];
  if (commodity) params.push(`commodity=${encodeURIComponent(commodity)}`);
  if (state) params.push(`state=${encodeURIComponent(state)}`);
  if (params.length) url += "?" + params.join("&");
  return get(url);
}

/**
 * Price history for a crop+state
 * GET /prices/history?commodity=Wheat&state=Punjab&days=180
 */
export async function getPriceHistory(commodity, state, days = 180) {
  return get(
    `/prices/history?commodity=${encodeURIComponent(commodity)}&state=${encodeURIComponent(state)}&days=${days}`,
  );
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function getCrops() {
  return get("/crops");
}

export async function getStates() {
  return get("/states");
}

export async function checkHealth() {
  return get("/health");
}

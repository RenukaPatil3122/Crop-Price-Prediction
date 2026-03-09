import { useState } from "react";
import {
  Sprout,
  TrendingUp,
  TrendingDown,
  Zap,
  BarChart3,
  Info,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const crops = [
  "Wheat",
  "Rice",
  "Tomato",
  "Onion",
  "Cotton",
  "Maize",
  "Soybean",
  "Potato",
  "Mustard",
  "Sugarcane",
];
const regions = [
  "Punjab",
  "Haryana",
  "Maharashtra",
  "Gujarat",
  "Nashik",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Rajasthan",
  "Karnataka",
  "Andhra Pradesh",
];
const seasons = ["Kharif (Jun–Oct)", "Rabi (Nov–Apr)", "Zaid (Mar–Jun)"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Simulated price forecast for next 6 months
const generateForecast = (base) => {
  const m = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  return m.map((month, i) => ({
    month,
    price: Math.round(base * (1 + (Math.random() * 0.3 - 0.1) + i * 0.02)),
    predicted: true,
  }));
};

const factorColors = {
  positive: "#16a34a",
  negative: "#ef4444",
  neutral: "#f59e0b",
};

export default function Predictions() {
  const [form, setForm] = useState({
    crop: "",
    region: "",
    season: "",
    month: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0 = form, 1 = result

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const allFilled = form.crop && form.region && form.season && form.month;

  const handlePredict = () => {
    if (!allFilled) return;
    setLoading(true);
    setTimeout(() => {
      const base = Math.floor(Math.random() * 3000) + 1500;
      const confidence = Math.floor(Math.random() * 18) + 79;
      const change = (Math.random() * 24 - 6).toFixed(1);
      const up = parseFloat(change) > 0;
      setResult({
        price: base,
        confidence,
        change,
        up,
        minPrice: Math.round(base * 0.88),
        maxPrice: Math.round(base * 1.12),
        forecast: generateForecast(base),
        factors: [
          {
            label: "Monsoon Outlook",
            impact: "Positive",
            detail: "Above normal rainfall predicted",
            type: "positive",
          },
          {
            label: "Market Demand",
            impact: up ? "High" : "Moderate",
            detail: up
              ? "Strong export demand this season"
              : "Domestic demand stable",
            type: up ? "positive" : "neutral",
          },
          {
            label: "Input Costs",
            impact: "Rising",
            detail: "Fertilizer prices increased 8%",
            type: "negative",
          },
          {
            label: "Competing Crops",
            impact: "Low",
            detail: "Fewer farmers switching this season",
            type: "positive",
          },
        ],
        historicalAvg: Math.round(base * 0.91),
        mspPrice: Math.round(base * 0.78),
      });
      setLoading(false);
      setStep(1);
    }, 2000);
  };

  const handleReset = () => {
    setStep(0);
    setResult(null);
    setForm({ crop: "", region: "", season: "", month: "" });
  };

  const inputStyle = {
    width: "100%",
    height: "42px",
    borderRadius: "10px",
    padding: "0 12px",
    fontSize: "14px",
    color: "#374151",
    background: "white",
    border: "1px solid #e5e7eb",
    outline: "none",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#6b7280",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#1f2937",
              margin: 0,
            }}
          >
            Crop Price Prediction
          </h1>
          <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
            AI-powered price forecasting for Indian agricultural markets
          </p>
        </div>
        {step === 1 && (
          <button
            onClick={handleReset}
            style={{
              padding: "8px 18px",
              borderRadius: "10px",
              background: "#f0fdf4",
              color: "#16a34a",
              fontWeight: 600,
              fontSize: "13px",
              border: "1px solid #bbf7d0",
              cursor: "pointer",
            }}
          >
            ← New Prediction
          </button>
        )}
      </div>

      {step === 0 ? (
        /* ── FORM ── */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* Input Form Card */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #f3f4f6",
              boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
              padding: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "#f0fdf4",
                  borderRadius: "10px",
                  padding: "8px",
                }}
              >
                <Sprout
                  style={{ width: "18px", height: "18px", color: "#16a34a" }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  Prediction Parameters
                </div>
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                  Fill all fields to generate prediction
                </div>
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label style={labelStyle}>Crop Type</label>
                <select
                  value={form.crop}
                  onChange={(e) => set("crop", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select a crop...</option>
                  {crops.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Region / State</label>
                <select
                  value={form.region}
                  onChange={(e) => set("region", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select a region...</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Season</label>
                <select
                  value={form.season}
                  onChange={(e) => set("season", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select a season...</option>
                  {seasons.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Target Month</label>
                <select
                  value={form.month}
                  onChange={(e) => set("month", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select a month...</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handlePredict}
                disabled={!allFilled || loading}
                style={{
                  marginTop: "8px",
                  height: "46px",
                  borderRadius: "12px",
                  background: allFilled
                    ? "linear-gradient(135deg, #166534 0%, #16A34A 100%)"
                    : "#e5e7eb",
                  color: allFilled ? "white" : "#9ca3af",
                  fontWeight: 700,
                  fontSize: "15px",
                  border: "none",
                  cursor: allFilled ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <>⏳ Analyzing market data...</>
                ) : (
                  <>
                    <Zap style={{ width: "16px", height: "16px" }} /> Generate
                    Prediction
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info / Tips Card */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #166534 0%, #16A34A 100%)",
                borderRadius: "16px",
                padding: "24px",
                color: "white",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                🤖 How It Works
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#bbf7d0",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Our model uses historical mandi prices, weather data, seasonal
                trends, and market demand signals to predict crop prices with
                high accuracy.
              </p>
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {[
                  "Random Forest ML Model",
                  "5+ years of mandi data",
                  "Real-time weather signals",
                  "MSP & policy factors",
                ].map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle
                      style={{
                        width: "14px",
                        height: "14px",
                        color: "#86efac",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "#d1fae5" }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #f3f4f6",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1f2937",
                  marginBottom: "12px",
                }}
              >
                📊 Popular Predictions Today
              </div>
              {[
                {
                  crop: "Wheat",
                  region: "Punjab",
                  price: "₹2,847",
                  trend: "+12%",
                  up: true,
                },
                {
                  crop: "Tomato",
                  region: "Nashik",
                  price: "₹2,900",
                  trend: "+8%",
                  up: true,
                },
                {
                  crop: "Onion",
                  region: "Maharashtra",
                  price: "₹1,650",
                  trend: "-3%",
                  up: false,
                },
                {
                  crop: "Rice",
                  region: "Haryana",
                  price: "₹3,520",
                  trend: "+5%",
                  up: true,
                },
              ].map(({ crop, region, price, trend, up }) => (
                <div
                  key={crop}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #f9fafb",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      {crop} · {region}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      {price}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: up ? "#16a34a" : "#ef4444",
                      }}
                    >
                      {trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── RESULT ── */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Top Result Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "16px",
            }}
          >
            {[
              {
                label: "Predicted Price",
                value: `₹${result.price.toLocaleString()}`,
                sub: `${form.crop} · ${form.month}`,
                color: "#16a34a",
                bg: "#f0fdf4",
                border: "#bbf7d0",
              },
              {
                label: "Price Range",
                value: `₹${result.minPrice.toLocaleString()} – ₹${result.maxPrice.toLocaleString()}`,
                sub: "Min – Max estimate",
                color: "#2563eb",
                bg: "#eff6ff",
                border: "#bfdbfe",
              },
              {
                label: "Confidence",
                value: `${result.confidence}%`,
                sub: "Model accuracy score",
                color: result.confidence > 85 ? "#16a34a" : "#f59e0b",
                bg: result.confidence > 85 ? "#f0fdf4" : "#fffbeb",
                border: result.confidence > 85 ? "#bbf7d0" : "#fde68a",
              },
              {
                label: "vs Historical Avg",
                value: `${result.up ? "+" : ""}${result.change}%`,
                sub: `Avg: ₹${result.historicalAvg.toLocaleString()}`,
                color: result.up ? "#16a34a" : "#ef4444",
                bg: result.up ? "#f0fdf4" : "#fef2f2",
                border: result.up ? "#bbf7d0" : "#fecaca",
              },
            ].map(({ label, value, sub, color, bg, border }) => (
              <div
                key={label}
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: "14px",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontWeight: 500,
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color,
                    marginBottom: "4px",
                  }}
                >
                  {value}
                </div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Chart + Factors */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr",
              gap: "20px",
            }}
          >
            {/* Forecast Chart */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #f3f4f6",
                boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                padding: "20px",
                height: "320px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ marginBottom: "12px", flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  6-Month Price Forecast
                </div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                  {form.crop} · {form.region} · ₹ per quintal
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.forecast} barSize={32}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F0F0F0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #E5E7EB",
                        fontSize: "12px",
                      }}
                      formatter={(v) => [
                        `₹${v.toLocaleString()}`,
                        "Predicted Price",
                      ]}
                    />
                    <ReferenceLine
                      y={result.historicalAvg}
                      stroke="#9ca3af"
                      strokeDasharray="4 4"
                      label={{ value: "Avg", fill: "#9ca3af", fontSize: 10 }}
                    />
                    <Bar dataKey="price" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Market Factors */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #f3f4f6",
                boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "16px",
                }}
              >
                <BarChart3
                  style={{ width: "16px", height: "16px", color: "#16a34a" }}
                />
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  Market Factors
                </div>
              </div>
              {result.factors.map(({ label, impact, detail, type }) => (
                <div
                  key={label}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background:
                      type === "positive"
                        ? "#f0fdf4"
                        : type === "negative"
                          ? "#fef2f2"
                          : "#fffbeb",
                    border: `1px solid ${type === "positive" ? "#bbf7d0" : type === "negative" ? "#fecaca" : "#fde68a"}`,
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "3px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: factorColors[type],
                        background: "white",
                        padding: "2px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      {impact}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>
                    {detail}
                  </div>
                </div>
              ))}

              {/* MSP Badge */}
              <div
                style={{
                  marginTop: "4px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Info
                    style={{ width: "14px", height: "14px", color: "#64748b" }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    MSP Reference
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                >
                  ₹{result.mspPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #166534 0%, #16A34A 100%)",
              borderRadius: "14px",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: "15px",
                  marginBottom: "4px",
                }}
              >
                {result.up ? "📈 Bullish Outlook" : "📉 Bearish Outlook"} for{" "}
                {form.crop} in {form.region}
              </div>
              <div style={{ color: "#bbf7d0", fontSize: "13px" }}>
                Predicted price of{" "}
                <strong style={{ color: "white" }}>
                  ₹{result.price.toLocaleString()}/quintal
                </strong>{" "}
                for {form.month} with {result.confidence}% confidence
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "10px",
                padding: "10px 16px",
              }}
            >
              {result.up ? (
                <TrendingUp
                  style={{ width: "22px", height: "22px", color: "#fde047" }}
                />
              ) : (
                <TrendingDown
                  style={{ width: "22px", height: "22px", color: "#fca5a5" }}
                />
              )}
              <span
                style={{
                  color: result.up ? "#fde047" : "#fca5a5",
                  fontWeight: 700,
                  fontSize: "20px",
                }}
              >
                {result.up ? "+" : ""}
                {result.change}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

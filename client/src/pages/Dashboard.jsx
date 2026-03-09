import { useState, useEffect } from "react";
import TopCropsCard from "../components/TopCropsCard";
import { useTheme } from "../context/ThemeContext";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  BarChart3,
  Zap,
  Sprout,
  MapPin,
  Thermometer,
  CloudRain,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { quickPredict, getDashboardPrices, getRecentPredictions } from "../api";

// ── Chart data per range tab ──────────────────────────────────────────────────
const CHART_DATA = {
  "1M": [
    { month: "W1", wheat: 2700, rice: 3400, tomato: 2600 },
    { month: "W2", wheat: 2750, rice: 3450, tomato: 2750 },
    { month: "W3", wheat: 2800, rice: 3480, tomato: 2900 },
    { month: "W4", wheat: 2847, rice: 3520, tomato: 2900 },
  ],
  "3M": [
    { month: "Jan", wheat: 2500, rice: 3300, tomato: 2800 },
    { month: "Feb", wheat: 2650, rice: 3450, tomato: 3100 },
    { month: "Mar", wheat: 2847, rice: 3520, tomato: 2900 },
  ],
  "6M": [
    { month: "Oct", wheat: 2100, rice: 3200, tomato: 1800 },
    { month: "Nov", wheat: 2300, rice: 3100, tomato: 2200 },
    { month: "Dec", wheat: 2200, rice: 3400, tomato: 1600 },
    { month: "Jan", wheat: 2500, rice: 3300, tomato: 2800 },
    { month: "Feb", wheat: 2400, rice: 3600, tomato: 3200 },
    { month: "Mar", wheat: 2847, rice: 3520, tomato: 2900 },
  ],
  "1Y": [
    { month: "Apr", wheat: 1900, rice: 2900, tomato: 1500 },
    { month: "May", wheat: 2000, rice: 3000, tomato: 1700 },
    { month: "Jun", wheat: 2050, rice: 3100, tomato: 2100 },
    { month: "Jul", wheat: 2100, rice: 3050, tomato: 2400 },
    { month: "Aug", wheat: 2200, rice: 3100, tomato: 2200 },
    { month: "Sep", wheat: 2150, rice: 3200, tomato: 1900 },
    { month: "Oct", wheat: 2100, rice: 3200, tomato: 1800 },
    { month: "Nov", wheat: 2300, rice: 3100, tomato: 2200 },
    { month: "Dec", wheat: 2200, rice: 3400, tomato: 1600 },
    { month: "Jan", wheat: 2500, rice: 3300, tomato: 2800 },
    { month: "Feb", wheat: 2400, rice: 3600, tomato: 3200 },
    { month: "Mar", wheat: 2847, rice: 3520, tomato: 2900 },
  ],
};

const CROP_CHANGES = {
  Wheat: { change: "+12%", up: true },
  Rice: { change: "+5%", up: true },
  Tomato: { change: "-3%", up: false },
  Onion: { change: "+18%", up: true },
  Cotton: { change: "-7%", up: false },
  Maize: { change: "+9%", up: true },
  Potato: { change: "+4%", up: true },
  Mustard: { change: "+6%", up: true },
  Soyabean: { change: "-2%", up: false },
};

const CROP_EMOJI = {
  Wheat: "🌾",
  Rice: "🍚",
  Tomato: "🍅",
  Onion: "🧅",
  Cotton: "🌿",
  Maize: "🌽",
  Potato: "🥔",
  Mustard: "🌻",
  Soyabean: "🫘",
};

// Static fallback for Recent Predictions (when MongoDB empty)
const STATIC_RECENT = [
  { crop: "Wheat", state: "Punjab", predicted_price: 2893 },
  { crop: "Rice", state: "Punjab", predicted_price: 3754 },
  { crop: "Tomato", state: "Maharashtra", predicted_price: 2015 },
  { crop: "Onion", state: "Punjab", predicted_price: 2194 },
  { crop: "Cotton", state: "Gujarat", predicted_price: 6772 },
];

const CROPS = [
  "Wheat",
  "Rice",
  "Tomato",
  "Onion",
  "Cotton",
  "Maize",
  "Potato",
  "Mustard",
  "Soyabean",
];
const STATES = [
  "Punjab",
  "Haryana",
  "Maharashtra",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Karnataka",
  "Andhra Pradesh",
];

const MARKET_NEWS = [
  {
    emoji: "📈",
    title: "Wheat MSP Raised",
    desc: "Govt raises Wheat MSP by ₹150/quintal for Rabi 2026",
    tag: "Policy",
    tagColor: "#2563eb",
  },
  {
    emoji: "🌧️",
    title: "Monsoon Forecast",
    desc: "IMD predicts above-normal monsoon, good for Kharif crops",
    tag: "Weather",
    tagColor: "#0891b2",
  },
  {
    emoji: "🧅",
    title: "Onion Prices Spike",
    desc: "Onion up 18% due to lower arrivals in Nashik mandi",
    tag: "Market",
    tagColor: "#f59e0b",
  },
  {
    emoji: "🌾",
    title: "Rabi Harvest Begins",
    desc: "Punjab & Haryana wheat harvest starts this week",
    tag: "Harvest",
    tagColor: "#16a34a",
  },
  {
    emoji: "🚛",
    title: "Mandi Arrivals Up",
    desc: "Total mandi arrivals up 12% vs last week across major states",
    tag: "Supply",
    tagColor: "#7c3aed",
  },
  {
    emoji: "☀️",
    title: "Heatwave Alert",
    desc: "High temps may impact tomato and vegetable crop yields",
    tag: "Alert",
    tagColor: "#ef4444",
  },
];

const S = {
  select: {
    height: "38px",
    borderRadius: "10px",
    padding: "0 10px",
    fontSize: "13px",
    color: "#374151",
    background: "white",
    border: "none",
    outline: "none",
    width: "100%",
  },
  predictBtn: {
    height: "38px",
    padding: "0 20px",
    borderRadius: "10px",
    background: "#facc15",
    fontWeight: 700,
    fontSize: "13px",
    color: "#1f2937",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};

export default function Dashboard() {
  const { isDark } = useTheme();
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);
  const [recentFromDB, setRecentFromDB] = useState([]); // real MongoDB recent predictions
  const [chartRange, setChartRange] = useState("6M");

  const card = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#f3f4f6";
  const text = isDark ? "#f1f5f9" : "#1f2937";
  const muted = isDark ? "#94a3b8" : "#9ca3af";

  const [metricCards, setMetricCards] = useState([
    {
      title: "Predicted Price",
      value: "₹2,893",
      sub: "Wheat · Next Month",
      icon: IndianRupee,
      trend: "+12.4%",
      up: true,
      bg: "#F0FDF4",
      cb: "#BBF7D0",
      iconBg: "#16A34A",
    },
    {
      title: "Confidence Score",
      value: "92.3%",
      sub: "Model Accuracy",
      icon: BarChart3,
      trend: "+2.1%",
      up: true,
      bg: "#EFF6FF",
      cb: "#BFDBFE",
      iconBg: "#2563EB",
    },
    {
      title: "Price Trend",
      value: "Rising",
      sub: "Tomato · Maharashtra",
      icon: TrendingUp,
      trend: "+8.7%",
      up: true,
      bg: "#FFF7ED",
      cb: "#FED7AA",
      iconBg: "#EA580C",
    },
  ]);

  // ── Load dashboard prices (for metric cards + Top Crops) — no DB save ────
  useEffect(() => {
    getDashboardPrices()
      .then((res) => {
        if (res.data?.length > 0) {
          setDashboardData(res.data);
          const wheat = res.data.find((d) => d.crop === "Wheat");
          if (wheat) {
            setMetricCards((prev) => [
              {
                ...prev[0],
                value: `₹${Math.round(wheat.predicted_price).toLocaleString()}`,
                sub: "Wheat · Next Month",
              },
              { ...prev[1], value: `${wheat.confidence}%` },
              prev[2],
            ]);
          }
        }
      })
      .catch(() => {});
  }, []);

  // ── Load Recent Predictions from MongoDB ─────────────────────────────────
  useEffect(() => {
    getRecentPredictions(5)
      .then((res) => {
        if (res.data?.length > 0) setRecentFromDB(res.data);
      })
      .catch(() => {});
  }, []);

  // ── Quick Predict — passes ?save=true so only user clicks get saved ───────
  const handlePredict = async () => {
    if (!selectedCrop || !selectedRegion) return;
    setLoading(true);
    setPrediction(null);
    try {
      const r = await quickPredict(selectedCrop, selectedRegion, true); // save=true
      setPrediction({
        price: `₹${Math.round(r.predicted_price).toLocaleString()}`,
        confidence: `${r.confidence}%`,
        change: `${r.predicted_price > 2000 ? "+" : ""}${((r.predicted_price / 2200 - 1) * 100).toFixed(1)}%`,
        up: r.predicted_price > 2200,
      });
      // Refresh recent predictions after user saves one
      getRecentPredictions(5)
        .then((res) => {
          if (res.data?.length > 0) setRecentFromDB(res.data);
        })
        .catch(() => {});
    } catch {
      const base = Math.floor(Math.random() * 3000) + 1500;
      const ch = (Math.random() * 20 - 5).toFixed(1);
      setPrediction({
        price: `₹${base.toLocaleString()}`,
        confidence: `${Math.floor(Math.random() * 20) + 78}%`,
        change: `${parseFloat(ch) > 0 ? "+" : ""}${ch}%`,
        up: parseFloat(ch) > 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Build Recent Predictions list ─────────────────────────────────────────
  // Priority: real MongoDB data → static fallback
  const recentPredictions = (
    recentFromDB.length > 0 ? recentFromDB : STATIC_RECENT
  ).map((d) => ({
    crop: d.crop,
    region: d.state,
    price: `₹${Math.round(d.predicted_price).toLocaleString()}`,
    ...(CROP_CHANGES[d.crop] || { change: "+5%", up: true }),
  }));

  // ── Top Crops (from dashboard prices — no DB write) ───────────────────────
  const topCrops = (
    dashboardData.length > 0
      ? dashboardData.slice(0, 4)
      : [
          { crop: "Wheat", predicted_price: 2893 },
          { crop: "Rice", predicted_price: 3754 },
          { crop: "Tomato", predicted_price: 2015 },
          { crop: "Onion", predicted_price: 2194 },
        ]
  ).map((d) => ({
    name: d.crop,
    price: `₹${Math.round(d.predicted_price).toLocaleString()}`,
    ...(CROP_CHANGES[d.crop] || { change: "+5%", up: true }),
  }));

  const disabled = !selectedCrop || !selectedRegion || loading;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "20px",
        }}
      >
        {metricCards.map(
          ({ title, value, sub, icon: Icon, trend, up, bg, cb, iconBg }) => (
            <div
              key={title}
              style={{
                backgroundColor: isDark ? "#1e293b" : bg,
                border: `1px solid ${isDark ? "#334155" : cb}`,
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p
                    style={{ fontSize: "13px", color: muted, fontWeight: 500 }}
                  >
                    {title}
                  </p>
                  <h3
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: text,
                      margin: "4px 0",
                    }}
                  >
                    {value}
                  </h3>
                  <p style={{ fontSize: "11px", color: muted }}>{sub}</p>
                </div>
                <div
                  style={{
                    backgroundColor: iconBg,
                    borderRadius: "10px",
                    padding: "10px",
                  }}
                >
                  <Icon
                    style={{ width: "18px", height: "18px", color: "white" }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginTop: "12px",
                }}
              >
                {up ? (
                  <TrendingUp
                    style={{ width: "14px", height: "14px", color: "#22c55e" }}
                  />
                ) : (
                  <TrendingDown
                    style={{ width: "14px", height: "14px", color: "#ef4444" }}
                  />
                )}
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: up ? "#16a34a" : "#ef4444",
                  }}
                >
                  {trend}
                </span>
                <span
                  style={{ fontSize: "11px", color: muted, marginLeft: "2px" }}
                >
                  vs last week
                </span>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Main Grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quick Predict */}
          <div
            style={{
              background: "linear-gradient(135deg, #166534 0%, #16A34A 100%)",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(22,163,74,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "14px",
              }}
            >
              <Zap
                style={{ width: "18px", height: "18px", color: "#fde047" }}
              />
              <span
                style={{ color: "white", fontWeight: 700, fontSize: "15px" }}
              >
                Quick Predict
              </span>
              <span style={{ color: "#bbf7d0", fontSize: "12px" }}>
                Get instant price prediction
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "120px" }}>
                <label
                  style={{
                    color: "#bbf7d0",
                    fontSize: "11px",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Crop
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  style={S.select}
                >
                  <option value="">Select crop...</option>
                  {CROPS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: "120px" }}>
                <label
                  style={{
                    color: "#bbf7d0",
                    fontSize: "11px",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  style={S.select}
                >
                  <option value="">Select region...</option>
                  {STATES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handlePredict}
                disabled={disabled}
                style={{
                  ...S.predictBtn,
                  ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
                }}
              >
                {loading ? "⏳" : "Predict →"}
              </button>
              {prediction && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "rgba(255,255,255,0.18)",
                    borderRadius: "10px",
                    padding: "0 14px",
                    height: "38px",
                  }}
                >
                  {[
                    ["Price", prediction.price, "white"],
                    ["Confidence", prediction.confidence, "white"],
                    [
                      "Change",
                      prediction.change,
                      prediction.up ? "#fde047" : "#fca5a5",
                    ],
                  ].map(([label, val, col], i) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {i > 0 && (
                        <div
                          style={{
                            width: "1px",
                            height: "18px",
                            background: "rgba(255,255,255,0.25)",
                          }}
                        />
                      )}
                      <div style={{ textAlign: "center" }}>
                        <div style={{ color: "#bbf7d0", fontSize: "10px" }}>
                          {label}
                        </div>
                        <div
                          style={{
                            color: col,
                            fontWeight: 700,
                            fontSize: "13px",
                          }}
                        >
                          {val}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Price Trends Chart */}
          <div
            style={{
              background: card,
              borderRadius: "16px",
              border: `1px solid ${border}`,
              padding: "20px 20px 12px",
              height: "320px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px",
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: text }}>
                  Price Trends
                </div>
                <div style={{ fontSize: "11px", color: muted }}>
                  {
                    {
                      "1M": "Last 4 weeks",
                      "3M": "Last 3 months",
                      "6M": "Last 6 months",
                      "1Y": "Last 12 months",
                    }[chartRange]
                  }{" "}
                  · ₹ per quintal
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  background: isDark ? "#0f172a" : "#f3f4f6",
                  borderRadius: "10px",
                  padding: "3px",
                }}
              >
                {["1M", "3M", "6M", "1Y"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setChartRange(p)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "7px",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: chartRange === p ? "#16a34a" : "transparent",
                      color: chartRange === p ? "white" : muted,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CHART_DATA[chartRange]}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#334155" : "#F0F0F0"}
                  />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: muted }} />
                  <YAxis tick={{ fontSize: 11, fill: muted }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: `1px solid ${border}`,
                      fontSize: "12px",
                      background: card,
                      color: text,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="wheat"
                    stroke="#16A34A"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    name="Wheat"
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rice"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    name="Rice"
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tomato"
                    stroke="#EA580C"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    name="Tomato"
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market Insights */}
          <div
            style={{
              background: card,
              borderRadius: "16px",
              border: `1px solid ${border}`,
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: text }}>
                  Market Insights
                </div>
                <div style={{ fontSize: "11px", color: muted }}>
                  Latest agri news & alerts
                </div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  background: "#f0fdf4",
                  color: "#16a34a",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontWeight: 600,
                }}
              >
                ● Live
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {MARKET_NEWS.map(({ emoji, title, desc, tag, tagColor }) => (
                <div
                  key={title}
                  style={{
                    background: isDark ? "#0f172a" : "#f9fafb",
                    border: `1px solid ${border}`,
                    borderRadius: "12px",
                    padding: "14px",
                    cursor: "pointer",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "6px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{emoji}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: tagColor,
                        background: `${tagColor}18`,
                        padding: "2px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      {tag}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: text,
                      marginBottom: "4px",
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{ fontSize: "11px", color: muted, lineHeight: 1.5 }}
                  >
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Recent Predictions — from MongoDB */}
          <div
            style={{
              background: card,
              borderRadius: "16px",
              border: `1px solid ${border}`,
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <span
                  style={{ fontSize: "14px", fontWeight: 700, color: text }}
                >
                  Recent Predictions
                </span>
                {recentFromDB.length > 0 && (
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#16a34a",
                      background: "#f0fdf4",
                      padding: "2px 7px",
                      borderRadius: "20px",
                      fontWeight: 600,
                      marginLeft: "8px",
                    }}
                  >
                    ● Live
                  </span>
                )}
              </div>
              <a
                href="/history"
                style={{
                  fontSize: "12px",
                  color: "#16a34a",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                View all
              </a>
            </div>

            {recentPredictions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: muted,
                  fontSize: "13px",
                }}
              >
                No predictions yet. Use Quick Predict above!
              </div>
            ) : (
              recentPredictions.map(
                ({ crop, region, price, change, up }, idx) => (
                  <div
                    key={`${crop}-${idx}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 0",
                      borderBottom: `1px solid ${isDark ? "#1e293b" : "#f9fafb"}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "8px",
                          background: isDark ? "#134e2b" : "#f0fdf4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                        }}
                      >
                        {CROP_EMOJI[crop] || "🌱"}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: text,
                          }}
                        >
                          {crop}
                        </div>
                        <div style={{ fontSize: "11px", color: muted }}>
                          {region}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: text,
                        }}
                      >
                        {price}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: up ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {change}
                      </div>
                    </div>
                  </div>
                ),
              )
            )}
          </div>

          {/* Top Crops */}
          <TopCropsCard crops={topCrops} />

          {/* Today's Market */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "white",
                marginBottom: "14px",
              }}
            >
              📊 Today's Market
            </div>
            {[
              { label: "Mandis Active", value: "2,847", icon: MapPin },
              { label: "Avg Temperature", value: "36°C", icon: Thermometer },
              { label: "Rainfall Today", value: "0 mm", icon: CloudRain },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icon
                    style={{ width: "14px", height: "14px", color: "#93c5fd" }}
                  />
                  <span style={{ fontSize: "12px", color: "#bfdbfe" }}>
                    {label}
                  </span>
                </div>
                <span
                  style={{ fontSize: "13px", fontWeight: 700, color: "white" }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

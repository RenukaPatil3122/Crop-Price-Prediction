import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  GitCompare,
  RefreshCw,
} from "lucide-react";
import { quickPredict, getForecast } from "../api";

const ALL_CROPS = [
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
const ALL_STATES = [
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

const CROP_EMOJI = {
  Wheat: "🌾",
  Rice: "🍚",
  Tomato: "🍅",
  Onion: "🧅",
  Cotton: "🌿",
  Maize: "🌽",
  Soyabean: "🫘",
  Potato: "🥔",
  Mustard: "🌻",
};
const CROP_COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CROP_META = {
  Wheat: {
    season: "Rabi",
    water: "Low",
    risk: "Low",
    demand: "High",
    export: "High",
  },
  Rice: {
    season: "Kharif",
    water: "High",
    risk: "Medium",
    demand: "High",
    export: "High",
  },
  Tomato: {
    season: "Zaid",
    water: "Medium",
    risk: "High",
    demand: "Medium",
    export: "Low",
  },
  Onion: {
    season: "Rabi",
    water: "Medium",
    risk: "High",
    demand: "High",
    export: "Medium",
  },
  Cotton: {
    season: "Kharif",
    water: "Medium",
    risk: "Medium",
    demand: "High",
    export: "High",
  },
  Maize: {
    season: "Kharif",
    water: "Medium",
    risk: "Low",
    demand: "Medium",
    export: "Medium",
  },
  Potato: {
    season: "Rabi",
    water: "Medium",
    risk: "Medium",
    demand: "High",
    export: "Low",
  },
  Mustard: {
    season: "Rabi",
    water: "Low",
    risk: "Low",
    demand: "Medium",
    export: "Medium",
  },
  Soyabean: {
    season: "Kharif",
    water: "Low",
    risk: "Low",
    demand: "Medium",
    export: "Medium",
  },
};

const RISK_SCORE = { Low: 85, Medium: 60, High: 35 };
const WATER_SCORE = { Low: 90, Medium: 65, High: 40 };
const DEMAND_SCORE = { Low: 40, Medium: 70, High: 95 };
const EXPORT_SCORE = { Low: 40, Medium: 70, High: 90 };

function scoreCard(meta) {
  return {
    "Price Stability": RISK_SCORE[meta.risk],
    "Water Efficiency": WATER_SCORE[meta.water],
    "Market Demand": DEMAND_SCORE[meta.demand],
    "Export Potential": EXPORT_SCORE[meta.export],
    Profitability: Math.round(
      (DEMAND_SCORE[meta.demand] + EXPORT_SCORE[meta.export]) / 2,
    ),
  };
}

const DEFAULT_SLOTS = [
  { crop: "Wheat", state: "Punjab" },
  { crop: "Rice", state: "Maharashtra" },
];

export default function Compare() {
  const { isDark } = useTheme();
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartTab, setChartTab] = useState("price");
  const [loaded, setLoaded] = useState(false);

  // ── Theme tokens ─────────────────────────────────────────────────────────
  const card = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const text = isDark ? "#f1f5f9" : "#111827";
  const muted = isDark ? "#94a3b8" : "#6b7280";
  const panelBg = isDark ? "#0f172a" : "#f8fafc";
  const cardShadow = isDark
    ? "none"
    : "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)";

  const fetchAll = useCallback(async () => {
    if (slots.length === 0) return;
    setLoading(true);
    try {
      const fetched = await Promise.all(
        slots.map(async ({ crop, state }, idx) => {
          try {
            const [pred, fcast] = await Promise.all([
              quickPredict(crop, state),
              getForecast(crop, state, 6),
            ]);
            return {
              crop,
              state,
              price: pred.predicted_price,
              confidence: pred.confidence,
              min: pred.min_price,
              max: pred.max_price,
              season: pred.season,
              forecast: fcast.forecast || [],
              color: CROP_COLORS[idx % CROP_COLORS.length],
              meta: CROP_META[crop] || CROP_META["Wheat"],
            };
          } catch {
            return {
              crop,
              state,
              price: 0,
              confidence: 0,
              min: 0,
              max: 0,
              season: "—",
              forecast: [],
              color: CROP_COLORS[idx],
              meta: CROP_META[crop] || CROP_META["Wheat"],
            };
          }
        }),
      );
      setResults(fetched);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [slots]);

  useEffect(() => {
    fetchAll();
  }, []);

  const addSlot = () => {
    if (slots.length >= 5) return;
    const unused = ALL_CROPS.find((c) => !slots.find((s) => s.crop === c));
    setSlots([...slots, { crop: unused || "Wheat", state: "Haryana" }]);
  };
  const removeSlot = (idx) => {
    setSlots(slots.filter((_, i) => i !== idx));
    setResults(results.filter((_, i) => i !== idx));
  };
  const updateSlot = (idx, key, val) => {
    setSlots(slots.map((s, i) => (i === idx ? { ...s, [key]: val } : s)));
  };

  const priceData = results.map((r) => ({
    name: `${CROP_EMOJI[r.crop] || "🌱"} ${r.crop}`,
    price: r.price,
    min: r.min,
    max: r.max,
    confidence: r.confidence,
  }));
  const forecastData = MONTH_NAMES.slice(0, 6).map((month, i) => {
    const obj = { month };
    results.forEach((r) => {
      obj[r.crop] = r.forecast[i]?.predicted_price ?? null;
    });
    return obj;
  });
  const radarDims = [
    "Price Stability",
    "Water Efficiency",
    "Market Demand",
    "Export Potential",
    "Profitability",
  ];
  const radarData = radarDims.map((dim) => {
    const obj = { dim };
    results.forEach((r) => {
      obj[r.crop] = scoreCard(r.meta)[dim];
    });
    return obj;
  });
  const rangeData = results.map((r) => ({
    name: `${CROP_EMOJI[r.crop] || ""} ${r.crop}`,
    min: Math.round(r.min),
    price: Math.round(r.price),
    max: Math.round(r.max),
  }));

  const bestPrice =
    results.length > 0
      ? results.reduce((a, b) => (a.price > b.price ? a : b))
      : null;
  const bestConfidence =
    results.length > 0
      ? results.reduce((a, b) => (a.confidence > b.confidence ? a : b))
      : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
              color: text,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <GitCompare
              style={{ width: "22px", height: "22px", color: "#16a34a" }}
            />{" "}
            Compare Crops
          </h1>
          <p style={{ fontSize: "13px", color: muted, marginTop: "4px" }}>
            Side-by-side price prediction & analysis for up to 5 crops
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 18px",
            borderRadius: "10px",
            background: "linear-gradient(135deg,#166534,#16a34a)",
            color: "white",
            fontWeight: 600,
            fontSize: "13px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
          }}
        >
          <RefreshCw
            style={{
              width: "14px",
              height: "14px",
              animation: loading ? "spin 1s linear infinite" : "none",
            }}
          />
          {loading ? "Comparing…" : "Compare Now"}
        </button>
      </div>

      {/* Crop Selector Row */}
      <div
        style={{
          background: card,
          borderRadius: "16px",
          border: `1px solid ${border}`,
          padding: "20px",
          boxShadow: cardShadow,
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: text,
            marginBottom: "14px",
          }}
        >
          Select Crops to Compare
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          {slots.map((slot, idx) => (
            <div
              key={idx}
              style={{
                background: panelBg,
                border: `2px solid ${CROP_COLORS[idx]}35`,
                borderRadius: "14px",
                padding: "14px",
                minWidth: "190px",
                position: "relative",
                boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: CROP_COLORS[idx],
                  }}
                />
                {slots.length > 2 && (
                  <button
                    onClick={() => removeSlot(idx)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: muted,
                      display: "flex",
                      padding: 0,
                    }}
                  >
                    <X style={{ width: "13px", height: "13px" }} />
                  </button>
                )}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: muted,
                  marginBottom: "6px",
                  fontWeight: 600,
                }}
              >
                Crop {idx + 1}
              </div>
              <select
                value={slot.crop}
                onChange={(e) => updateSlot(idx, "crop", e.target.value)}
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: "8px",
                  border: `1px solid ${isDark ? "#475569" : "#d1d5db"}`,
                  background: card,
                  color: text,
                  fontSize: "13px",
                  outline: "none",
                  marginBottom: "8px",
                }}
              >
                {ALL_CROPS.map((c) => (
                  <option key={c} value={c}>
                    {CROP_EMOJI[c]} {c}
                  </option>
                ))}
              </select>
              <select
                value={slot.state}
                onChange={(e) => updateSlot(idx, "state", e.target.value)}
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: "8px",
                  border: `1px solid ${isDark ? "#475569" : "#d1d5db"}`,
                  background: card,
                  color: text,
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                {ALL_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {slots.length < 5 && (
            <button
              onClick={addSlot}
              style={{
                minWidth: "140px",
                height: "110px",
                borderRadius: "14px",
                border: `2px dashed ${isDark ? "#334155" : "#d1d5db"}`,
                background: "transparent",
                color: muted,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#16a34a";
                e.currentTarget.style.color = "#16a34a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark
                  ? "#334155"
                  : "#d1d5db";
                e.currentTarget.style.color = muted;
              }}
            >
              <Plus style={{ width: "20px", height: "20px" }} />
              Add Crop
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loaded && results.length > 0 && (
        <>
          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${results.length},1fr)`,
              gap: "14px",
            }}
          >
            {results.map((r) => (
              <div
                key={r.crop + r.state}
                style={{
                  background: card,
                  borderRadius: "16px",
                  border: `2px solid ${r.color}25`,
                  padding: "18px",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: cardShadow,
                }}
              >
                {/* Color bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: r.color,
                    borderRadius: "16px 16px 0 0",
                  }}
                />
                {/* Badges */}
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {bestPrice?.crop === r.crop &&
                    bestPrice?.state === r.state && (
                      <span
                        style={{
                          fontSize: "10px",
                          background: isDark
                            ? "rgba(251,191,36,0.15)"
                            : "#fef3c7",
                          color: "#d97706",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontWeight: 700,
                          border: "1px solid #fde68a",
                        }}
                      >
                        👑 Highest Price
                      </span>
                    )}
                  {bestConfidence?.crop === r.crop &&
                    bestConfidence?.state === r.state && (
                      <span
                        style={{
                          fontSize: "10px",
                          background: isDark
                            ? "rgba(22,163,74,0.15)"
                            : "#dcfce7",
                          color: "#16a34a",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontWeight: 700,
                          border: "1px solid #86efac",
                        }}
                      >
                        🎯 Best Confidence
                      </span>
                    )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: `${r.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                    }}
                  >
                    {CROP_EMOJI[r.crop] || "🌱"}
                  </div>
                  <div>
                    <div
                      style={{ fontSize: "14px", fontWeight: 700, color: text }}
                    >
                      {r.crop}
                    </div>
                    <div style={{ fontSize: "11px", color: muted }}>
                      {r.state}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    color: r.color,
                    marginBottom: "4px",
                  }}
                >
                  ₹
                  {r.price.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: muted,
                    marginBottom: "12px",
                  }}
                >
                  per quintal · {r.season}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  {[
                    {
                      label: "Min",
                      value: `₹${Math.round(r.min).toLocaleString()}`,
                    },
                    {
                      label: "Max",
                      value: `₹${Math.round(r.max).toLocaleString()}`,
                    },
                    { label: "Conf", value: `${r.confidence}%` },
                    { label: "Season", value: r.season },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        background: panelBg,
                        borderRadius: "8px",
                        padding: "8px 10px",
                        border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: muted,
                          fontWeight: 600,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: text,
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontSize: "10px", color: muted }}>
                      Confidence
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: r.color,
                      }}
                    >
                      {r.confidence}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "5px",
                      background: isDark ? "#334155" : "#e5e7eb",
                      borderRadius: "3px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${r.confidence}%`,
                        background: r.color,
                        borderRadius: "3px",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div
            style={{
              background: card,
              borderRadius: "16px",
              border: `1px solid ${border}`,
              overflow: "hidden",
              boxShadow: cardShadow,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "2px",
                padding: "14px 20px 0",
                borderBottom: `1px solid ${border}`,
              }}
            >
              {[
                { key: "price", label: "📊 Price Range" },
                { key: "forecast", label: "📈 6M Forecast" },
                { key: "radar", label: "🕸 Crop Profile" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setChartTab(key)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: "8px 8px 0 0",
                    cursor: "pointer",
                    background:
                      chartTab === key
                        ? isDark
                          ? "#0f172a"
                          : "white"
                        : "transparent",
                    color: chartTab === key ? "#16a34a" : muted,
                    borderBottom:
                      chartTab === key
                        ? "2px solid #16a34a"
                        : "2px solid transparent",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div style={{ padding: "20px" }}>
              {chartTab === "price" && (
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: muted,
                      marginBottom: "16px",
                    }}
                  >
                    Predicted price with min/max range (₹ per quintal)
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={rangeData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#334155" : "#f3f4f6"}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: muted, fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: muted, fontSize: 11 }}
                        tickFormatter={(v) => `₹${v.toLocaleString()}`}
                      />
                      <Tooltip
                        formatter={(v) => `₹${v.toLocaleString()}`}
                        contentStyle={{
                          background: card,
                          border: `1px solid ${border}`,
                          borderRadius: "10px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="min"
                        name="Min Price"
                        fill="#94a3b8"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="price"
                        name="Predicted"
                        fill="#16a34a"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="max"
                        name="Max Price"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {chartTab === "forecast" && (
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: muted,
                      marginBottom: "16px",
                    }}
                  >
                    6-month price forecast comparison (₹ per quintal)
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={forecastData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#334155" : "#f3f4f6"}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: muted, fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: muted, fontSize: 11 }}
                        tickFormatter={(v) => `₹${v.toLocaleString()}`}
                      />
                      <Tooltip
                        formatter={(v) => `₹${v?.toLocaleString?.() ?? v}`}
                        contentStyle={{
                          background: card,
                          border: `1px solid ${border}`,
                          borderRadius: "10px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend />
                      {results.map((r) => (
                        <Line
                          key={r.crop}
                          type="monotone"
                          dataKey={r.crop}
                          stroke={r.color}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: r.color }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {chartTab === "radar" && (
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: muted,
                      marginBottom: "16px",
                    }}
                  >
                    Multi-dimensional crop profile — higher score = better
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart
                      data={radarData}
                      margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                    >
                      <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
                      <PolarAngleAxis
                        dataKey="dim"
                        tick={{ fill: muted, fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: muted, fontSize: 10 }}
                        tickCount={4}
                      />
                      {results.map((r) => (
                        <Radar
                          key={r.crop}
                          name={r.crop}
                          dataKey={r.crop}
                          stroke={r.color}
                          fill={r.color}
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                      ))}
                      <Legend />
                      <Tooltip
                        contentStyle={{
                          background: card,
                          border: `1px solid ${border}`,
                          borderRadius: "10px",
                          fontSize: "12px",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Detail Table */}
          <div
            style={{
              background: card,
              borderRadius: "16px",
              border: `1px solid ${border}`,
              overflow: "hidden",
              boxShadow: cardShadow,
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${border}`,
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 700, color: text }}>
                📋 Detailed Comparison
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: isDark ? "#0f172a" : "#f8fafc" }}>
                    <th
                      style={{
                        padding: "11px 20px",
                        fontSize: "11px",
                        color: muted,
                        fontWeight: 700,
                        textAlign: "left",
                        borderBottom: `1px solid ${border}`,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      Attribute
                    </th>
                    {results.map((r) => (
                      <th
                        key={r.crop + r.state}
                        style={{
                          padding: "11px 16px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: r.color,
                          textAlign: "center",
                          borderBottom: `1px solid ${border}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {CROP_EMOJI[r.crop]} {r.crop}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "State", key: "state" },
                    {
                      label: "Predicted Price",
                      key: "price",
                      fmt: (v) => `₹${Math.round(v).toLocaleString()}`,
                    },
                    {
                      label: "Min Price",
                      key: "min",
                      fmt: (v) => `₹${Math.round(v).toLocaleString()}`,
                    },
                    {
                      label: "Max Price",
                      key: "max",
                      fmt: (v) => `₹${Math.round(v).toLocaleString()}`,
                    },
                    {
                      label: "Confidence",
                      key: "confidence",
                      fmt: (v) => `${v}%`,
                    },
                    { label: "Season", key: "season" },
                    { label: "Water Needs", key: "meta", fmt: (v) => v.water },
                    { label: "Market Risk", key: "meta", fmt: (v) => v.risk },
                    {
                      label: "Market Demand",
                      key: "meta",
                      fmt: (v) => v.demand,
                    },
                    {
                      label: "Export Potential",
                      key: "meta",
                      fmt: (v) => v.export,
                    },
                  ].map(({ label, key, fmt }, rowIdx) => {
                    const vals = results.map((r) =>
                      fmt ? fmt(r[key]) : r[key],
                    );
                    return (
                      <tr
                        key={label}
                        style={{
                          borderBottom: `1px solid ${border}`,
                          background:
                            rowIdx % 2 === 0
                              ? "transparent"
                              : isDark
                                ? "rgba(255,255,255,0.01)"
                                : "rgba(0,0,0,0.01)",
                        }}
                      >
                        <td
                          style={{
                            padding: "10px 20px",
                            fontSize: "12px",
                            color: muted,
                            fontWeight: 600,
                          }}
                        >
                          {label}
                        </td>
                        {vals.map((val, i) => {
                          const numericKeys = ["price", "confidence", "max"];
                          const isBest =
                            numericKeys.includes(key) &&
                            val ===
                              Math.max(
                                ...vals.map((v) =>
                                  parseFloat(String(v).replace(/[₹,%]/g, "")),
                                ),
                              );
                          return (
                            <td
                              key={i}
                              style={{
                                padding: "10px 16px",
                                fontSize: "12px",
                                fontWeight: isBest ? 700 : 500,
                                color: isBest ? results[i].color : text,
                                textAlign: "center",
                              }}
                            >
                              {isBest && "★ "}
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation */}
          {bestPrice && (
            <div
              style={{
                background: isDark ? "rgba(22,163,74,0.08)" : "#f0fdf4",
                border: `1px solid ${isDark ? "rgba(22,163,74,0.2)" : "#86efac"}`,
                borderRadius: "16px",
                padding: "18px 22px",
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                boxShadow: isDark ? "none" : "0 1px 4px rgba(22,163,74,0.1)",
              }}
            >
              <span style={{ fontSize: "24px" }}>💡</span>
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#16a34a",
                    marginBottom: "4px",
                  }}
                >
                  AgriSense Recommendation
                </div>
                <div style={{ fontSize: "13px", color: text, lineHeight: 1.6 }}>
                  Based on current predictions,{" "}
                  <strong>{bestPrice.crop}</strong> in{" "}
                  <strong>{bestPrice.state}</strong> offers the highest price at{" "}
                  <strong>
                    ₹{Math.round(bestPrice.price).toLocaleString()}/quintal
                  </strong>
                  .{" "}
                  {bestConfidence && bestConfidence.crop !== bestPrice.crop
                    ? `For highest prediction accuracy, consider ${bestConfidence.crop} with ${bestConfidence.confidence}% confidence.`
                    : `It also has the highest model confidence at ${bestConfidence?.confidence}%.`}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loaded && !loading && (
        <div
          style={{
            background: card,
            borderRadius: "16px",
            border: `1px solid ${border}`,
            padding: "64px",
            textAlign: "center",
            boxShadow: cardShadow,
          }}
        >
          <GitCompare
            style={{
              width: "40px",
              height: "40px",
              color: muted,
              margin: "0 auto 16px",
              display: "block",
            }}
          />
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: text,
              marginBottom: "8px",
            }}
          >
            Select crops and click Compare
          </div>
          <div style={{ fontSize: "13px", color: muted }}>
            Compare up to 5 crops side-by-side with price predictions,
            forecasts, and profiles
          </div>
        </div>
      )}
    </div>
  );
}

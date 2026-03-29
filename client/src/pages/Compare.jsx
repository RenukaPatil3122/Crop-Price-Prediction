import { useState, useEffect, useCallback, useRef } from "react";
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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
const CROP_COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa"];

const CROP_META_FALLBACK = {
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

/* ── Card Shell ─────────────────────────────────────────────────────────────── */
function Card({
  children,
  isDark,
  cardBorder,
  cardShadow,
  style = {},
  className = "",
}) {
  return (
    <div
      className={className}
      style={{
        background: isDark ? "rgba(30,41,59,0.8)" : "white",
        borderRadius: "22px",
        border: `1px solid ${cardBorder}`,
        boxShadow: cardShadow,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "15%",
          right: "15%",
          height: "1px",
          background: `linear-gradient(90deg,transparent,${isDark ? "rgba(52,211,153,0.3)" : "rgba(22,163,74,0.2)"},transparent)`,
          pointerEvents: "none",
        }}
      />
      {isDark && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "22px",
            backgroundImage:
              "radial-gradient(rgba(52,211,153,0.025) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
      )}
      {children}
    </div>
  );
}

/* ── Custom Tooltip ──────────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(8,12,28,0.96)",
        border: "1px solid rgba(52,211,153,0.25)",
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 0 20px rgba(52,211,153,0.1), 0 8px 24px rgba(0,0,0,0.5)",
        backdropFilter: "blur(16px)",
      }}
    >
      <p
        style={{
          color: "#64748b",
          fontSize: "11px",
          margin: "0 0 6px",
          fontWeight: 600,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </p>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "3px",
          }}
        >
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 6px ${p.color}80`,
            }}
          />
          <span
            style={{ color: "#94a3b8", fontSize: "11px", minWidth: "60px" }}
          >
            {p.name}
          </span>
          <span
            style={{
              color: "white",
              fontWeight: 800,
              fontSize: "13px",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            ₹{Number(p.value)?.toLocaleString?.() ?? p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Main ────────────────────────────────────────────────────────────────────── */
export default function Compare() {
  const { isDark } = useTheme();
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartTab, setChartTab] = useState("price");
  const [loaded, setLoaded] = useState(false);
  const [cropMeta, setCropMeta] = useState(CROP_META_FALLBACK);

  /* ── Theme tokens ── */
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const text = isDark ? "#e8edf8" : "#0f172a";
  const muted = isDark ? "#94a3b8" : "#4b5563";
  const cardShadow = isDark
    ? "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
    : "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)";
  const gridC = isDark ? "rgba(255,255,255,0.04)" : "#f0f0f0";

  useEffect(() => {
    fetch(`${API_BASE}/crops/meta`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data) setCropMeta(j.data);
      })
      .catch(() => {});
  }, []);

  const fetchAll = useCallback(async () => {
    if (!slots.length) return;
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
              meta:
                cropMeta[crop] ||
                CROP_META_FALLBACK[crop] ||
                CROP_META_FALLBACK["Wheat"],
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
              meta:
                cropMeta[crop] ||
                CROP_META_FALLBACK[crop] ||
                CROP_META_FALLBACK["Wheat"],
            };
          }
        }),
      );
      setResults(fetched);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [slots, cropMeta]);

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
  const updateSlot = (idx, key, val) =>
    setSlots(slots.map((s, i) => (i === idx ? { ...s, [key]: val } : s)));

  const rangeData = results.map((r) => ({
    name: `${CROP_EMOJI[r.crop] || ""} ${r.crop}`,
    min: Math.round(r.min),
    price: Math.round(r.price),
    max: Math.round(r.max),
  }));
  const forecastData = Array.from({ length: 6 }, (_, i) => {
    const obj = { month: results[0]?.forecast[i]?.month || `M${i + 1}` };
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

  const bestPrice = results.length
    ? results.reduce((a, b) => (a.price > b.price ? a : b))
    : null;
  const bestConfidence = results.length
    ? results.reduce((a, b) => (a.confidence > b.confidence ? a : b))
    : null;

  /* ── Styled Select ── */
  const selectStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "10px",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
    background: isDark ? "rgba(15,23,42,0.8)" : "white",
    color: isDark ? "#f1f5f9" : "#111827",
    fontSize: "13px",
    fontWeight: 500,
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { 0%{opacity:0;transform:scale(0.92) translateY(10px)} 60%{transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .cmp-fade-1 { animation: fadeUp 0.45s 0.00s ease both; }
        .cmp-fade-2 { animation: fadeUp 0.45s 0.07s ease both; }
        .cmp-fade-3 { animation: fadeUp 0.45s 0.14s ease both; }
        .cmp-fade-4 { animation: fadeUp 0.45s 0.21s ease both; }
        .cmp-fade-5 { animation: fadeUp 0.45s 0.28s ease both; }

        .pulse-dot { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
        .cmp-spin  { animation: spin 1s linear infinite; }

        .slot-card { transition: border-color 0.2s, box-shadow 0.2s; }
        .slot-card:hover { box-shadow: 0 0 0 1px rgba(52,211,153,0.2), 0 4px 20px rgba(52,211,153,0.06); }

        .add-crop-btn { transition: all 0.2s; }
        .add-crop-btn:hover { border-color: #34d399 !important; color: #34d399 !important; background: rgba(52,211,153,0.04) !important; }

        .chart-tab { transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
        .chart-tab:hover { color: #34d399 !important; }

        .table-row { transition: background 0.15s; }
        .table-row:hover { background: ${isDark ? "rgba(52,211,153,0.04)" : "#f0fdf4"} !important; }

        .cmp-btn { transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        .cmp-btn:not(:disabled):hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 32px rgba(22,163,74,0.4) !important; }
        .cmp-btn:not(:disabled):active { transform: scale(0.97); }

        /* ── Responsive ── */
        .cmp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cmp-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 12px;
          align-items: flex-start;
        }
        .cmp-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }
        .cmp-chart-tabs {
          display: flex;
          gap: 4px;
          padding: 16px 22px 0;
          border-bottom: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"};
          position: relative;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .cmp-chart-tabs::-webkit-scrollbar { display: none; }
        .cmp-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        @media (max-width: 640px) {
          .cmp-summary-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .cmp-slots-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        ${isDark ? "select option { background: #1e293b; color: #f1f5f9; }" : ""}
      `}</style>

      {/* ── HEADER ── */}
      <div className="cmp-fade-1 cmp-header">
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: text,
              margin: 0,
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                background: "rgba(52,211,153,0.12)",
                border: "1px solid rgba(52,211,153,0.2)",
                borderRadius: "10px",
                padding: "8px",
                display: "flex",
              }}
            >
              <GitCompare
                style={{ width: "18px", height: "18px", color: "#34d399" }}
              />
            </div>
            Compare Crops
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: muted,
              marginTop: "4px",
              fontWeight: 400,
            }}
          >
            Side-by-side price prediction &amp; analysis for up to 5 crops
          </p>
        </div>
        <button
          className="cmp-btn"
          onClick={fetchAll}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 20px",
            borderRadius: "14px",
            background: "linear-gradient(135deg,#166534 0%,#16A34A 100%)",
            color: "white",
            fontWeight: 800,
            fontSize: "13px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 4px 20px rgba(22,163,74,0.3)",
            letterSpacing: "0.01em",
            flexShrink: 0,
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

      {/* ── CROP SELECTOR ── */}
      <Card
        isDark={isDark}
        cardBorder={cardBorder}
        cardShadow={cardShadow}
        className="cmp-fade-2"
        style={{ padding: "24px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              background: isDark ? "rgba(52,211,153,0.1)" : "#f0fdf4",
              border: "1px solid rgba(52,211,153,0.2)",
              borderRadius: "8px",
              padding: "7px",
            }}
          >
            <GitCompare
              style={{ width: "13px", height: "13px", color: "#34d399" }}
            />
          </div>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: text,
              letterSpacing: "-0.01em",
            }}
          >
            Select Crops to Compare
          </span>
        </div>

        {/* FIX 1: CSS grid auto-fill instead of flex wrap */}
        <div className="cmp-slots-grid">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className="slot-card"
              style={{
                background: isDark ? "rgba(15,23,42,0.7)" : "#f8fafc",
                border: `1.5px solid ${CROP_COLORS[idx]}35`,
                borderRadius: "16px",
                padding: "16px",
                position: "relative",
                boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              {/* Color dot + close */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: CROP_COLORS[idx],
                    boxShadow: `0 0 8px ${CROP_COLORS[idx]}60`,
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
                  fontSize: "10px",
                  color: muted,
                  marginBottom: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Crop {idx + 1}
              </div>
              <select
                value={slot.crop}
                onChange={(e) => updateSlot(idx, "crop", e.target.value)}
                style={{ ...selectStyle, marginBottom: "8px" }}
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
                style={selectStyle}
              >
                {ALL_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Add Crop button — lives inside the same grid */}
          {slots.length < 5 && (
            <button
              className="add-crop-btn"
              onClick={addSlot}
              style={{
                minHeight: "130px",
                borderRadius: "16px",
                border: `2px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                background: "transparent",
                color: muted,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: isDark
                    ? "rgba(52,211,153,0.08)"
                    : "rgba(52,211,153,0.06)",
                  border: "1px solid rgba(52,211,153,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus
                  style={{ width: "16px", height: "16px", color: "#34d399" }}
                />
              </div>
              Add Crop
            </button>
          )}
        </div>
      </Card>

      {/* ── RESULTS ── */}
      {loaded && results.length > 0 && (
        <>
          {/* FIX 2: Summary cards — auto-fill grid instead of fixed repeat(N) */}
          <div className="cmp-fade-3 cmp-summary-grid">
            {results.map((r) => (
              <div
                key={r.crop + r.state}
                style={{
                  background: isDark
                    ? "rgba(30,41,59,0.8)"
                    : "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
                  borderRadius: "20px",
                  padding: "20px",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                  boxShadow: cardShadow,
                  position: "relative",
                  overflow: "hidden",
                  animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
                }}
              >
                {/* Color top bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: `linear-gradient(90deg,${r.color},${r.color}88)`,
                    borderRadius: "20px 20px 0 0",
                  }}
                />
                {/* Ambient blob */}
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-15px",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle,${r.color}20 0%,transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />

                {/* Badges */}
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    marginBottom: "10px",
                    flexWrap: "wrap",
                    position: "relative",
                  }}
                >
                  {bestPrice?.crop === r.crop &&
                    bestPrice?.state === r.state && (
                      <span
                        style={{
                          fontSize: "10px",
                          background: isDark
                            ? "rgba(251,191,36,0.12)"
                            : "#fef3c7",
                          color: "#d97706",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontWeight: 700,
                          border: "1px solid rgba(251,191,36,0.3)",
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
                            ? "rgba(52,211,153,0.12)"
                            : "#dcfce7",
                          color: "#34d399",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontWeight: 700,
                          border: "1px solid rgba(52,211,153,0.3)",
                        }}
                      >
                        🎯 Best Confidence
                      </span>
                    )}
                </div>

                {/* Crop header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "14px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "12px",
                      background: `${r.color}18`,
                      border: `1px solid ${r.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      boxShadow: `0 0 12px ${r.color}15`,
                      flexShrink: 0,
                    }}
                  >
                    {CROP_EMOJI[r.crop] || "🌱"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: text,
                        letterSpacing: "-0.01em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.crop}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: muted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.state}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    color: r.color,
                    marginBottom: "3px",
                    fontFamily: "'DM Mono',monospace",
                    letterSpacing: "-0.03em",
                    textShadow: `0 0 20px ${r.color}30`,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
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
                    marginBottom: "14px",
                  }}
                >
                  per quintal · {r.season}
                </div>

                {/* Mini stats grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    marginBottom: "14px",
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
                        background: isDark
                          ? "rgba(255,255,255,0.04)"
                          : "#f8fafc",
                        borderRadius: "10px",
                        padding: "9px 11px",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: muted,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "3px",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          color: text,
                          fontFamily: "'DM Mono',monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Confidence bar */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: muted,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Confidence
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        color: r.color,
                      }}
                    >
                      {r.confidence}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "5px",
                      background: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
                      borderRadius: "3px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${r.confidence}%`,
                        background: `linear-gradient(90deg,${r.color},${r.color}cc)`,
                        borderRadius: "3px",
                        transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                        boxShadow: `0 0 8px ${r.color}40`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Card */}
          <Card
            isDark={isDark}
            cardBorder={cardBorder}
            cardShadow={cardShadow}
            className="cmp-fade-4"
            style={{ overflow: "hidden" }}
          >
            {/* FIX 3: Tab bar scrollable on mobile */}
            <div className="cmp-chart-tabs">
              {[
                { key: "price", label: "📊 Price Range" },
                { key: "forecast", label: "📈 6M Forecast" },
                { key: "radar", label: "🕸 Crop Profile" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className="chart-tab"
                  onClick={() => setChartTab(key)}
                  style={{
                    padding: "9px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: "10px 10px 0 0",
                    cursor: "pointer",
                    background:
                      chartTab === key
                        ? isDark
                          ? "rgba(52,211,153,0.1)"
                          : "#f0fdf4"
                        : "transparent",
                    color: chartTab === key ? "#34d399" : muted,
                    borderBottom:
                      chartTab === key
                        ? "2px solid #34d399"
                        : "2px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: "22px", position: "relative" }}>
              {chartTab === "price" && (
                <>
                  <div
                    style={{
                      fontSize: "12px",
                      color: muted,
                      marginBottom: "16px",
                      fontWeight: 500,
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
                        stroke={gridC}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: muted, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: muted, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${v.toLocaleString()}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const crop = results.find(
                            (r) =>
                              `${CROP_EMOJI[r.crop] || ""} ${r.crop}` ===
                              payload[0]?.payload?.name,
                          );
                          return (
                            <div
                              style={{
                                background: "rgba(8,12,28,0.96)",
                                border: "1px solid rgba(52,211,153,0.25)",
                                borderRadius: "12px",
                                padding: "10px 14px",
                                backdropFilter: "blur(16px)",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 800,
                                  marginBottom: 6,
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <span>{CROP_EMOJI[crop?.crop]}</span>
                                {crop?.crop}
                              </div>
                              <div
                                style={{ color: "#60a5fa", fontSize: "12px" }}
                              >
                                Max : ₹
                                {payload
                                  .find((p) => p.dataKey === "max")
                                  ?.value?.toLocaleString()}
                              </div>
                              <div
                                style={{ color: "#94a3b8", fontSize: "12px" }}
                              >
                                Min : ₹
                                {payload
                                  .find((p) => p.dataKey === "min")
                                  ?.value?.toLocaleString()}
                              </div>
                              <div
                                style={{
                                  color: "#34d399",
                                  fontWeight: 800,
                                  fontSize: "13px",
                                }}
                              >
                                Predicted : ₹
                                {payload
                                  .find((p) => p.dataKey === "price")
                                  ?.value?.toLocaleString()}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar
                        dataKey="min"
                        name="Min Price"
                        fill={isDark ? "rgba(148,163,184,0.6)" : "#cbd5e1"}
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="price"
                        name="Predicted"
                        fill="#34d399"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="max"
                        name="Max Price"
                        fill="#60a5fa"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
              {chartTab === "forecast" && (
                <>
                  <div
                    style={{
                      fontSize: "12px",
                      color: muted,
                      marginBottom: "16px",
                      fontWeight: 500,
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
                        stroke={gridC}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: muted, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: muted, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${v.toLocaleString()}`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      {results.map((r) => (
                        <Line
                          key={r.crop}
                          type="monotone"
                          dataKey={r.crop}
                          stroke={r.color}
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: r.color, strokeWidth: 0 }}
                          activeDot={{
                            r: 5,
                            strokeWidth: 2,
                            stroke: r.color + "60",
                          }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}
              {chartTab === "radar" && (
                <>
                  <div
                    style={{
                      fontSize: "12px",
                      color: muted,
                      marginBottom: "16px",
                      fontWeight: 500,
                    }}
                  >
                    Multi-dimensional crop profile — higher score = better
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart
                      data={radarData}
                      margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                    >
                      <PolarGrid
                        stroke={isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}
                      />
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
                          fillOpacity={0.18}
                          strokeWidth={2}
                        />
                      ))}
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Tooltip content={<ChartTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </Card>

          {/* Detail Table */}
          <Card
            isDark={isDark}
            cardBorder={cardBorder}
            cardShadow={cardShadow}
            className="cmp-fade-4"
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "18px 22px",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: text,
                  letterSpacing: "-0.01em",
                }}
              >
                📋 Detailed Comparison
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: "#34d399",
                  background: isDark ? "rgba(52,211,153,0.1)" : "#dcfce7",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontWeight: 700,
                  border: "1px solid rgba(52,211,153,0.25)",
                }}
              >
                ✓ Live ML data
              </span>
            </div>
            <div
              style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                position: "relative",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "400px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                    }}
                  >
                    <th
                      style={{
                        padding: "11px 22px",
                        fontSize: "11px",
                        color: muted,
                        fontWeight: 700,
                        textAlign: "left",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Attribute
                    </th>
                    {results.map((r) => (
                      <th
                        key={r.crop + r.state}
                        style={{
                          padding: "11px 18px",
                          fontSize: "13px",
                          fontWeight: 800,
                          color: r.color,
                          textAlign: "center",
                          letterSpacing: "-0.01em",
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
                        className="table-row"
                        style={{
                          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}`,
                        }}
                      >
                        <td
                          style={{
                            padding: "11px 22px",
                            fontSize: "12px",
                            color: muted,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
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
                                padding: "11px 18px",
                                fontSize: "13px",
                                fontWeight: isBest ? 800 : 500,
                                color: isBest ? results[i].color : text,
                                textAlign: "center",
                                fontFamily: numericKeys.includes(key)
                                  ? "'DM Mono',monospace"
                                  : "inherit",
                                letterSpacing: "-0.01em",
                                whiteSpace: "nowrap",
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
          </Card>

          {/* ── AgriSense Recommendation Banner ── */}
          {bestPrice && (
            <div
              className="cmp-fade-5"
              style={{
                background: "linear-gradient(135deg,#166534 0%,#16A34A 100%)",
                borderRadius: "22px",
                padding: "18px 24px",
                border: "1px solid rgba(52,211,153,0.2)",
                boxShadow:
                  "0 8px 40px rgba(22,163,74,0.2), 0 0 80px rgba(52,211,153,0.05)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Shimmer */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    "linear-gradient(90deg,transparent,rgba(52,211,153,0.5),transparent)",
                }}
              />
              {/* Blob */}
              <div
                style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-20px",
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle,rgba(52,211,153,0.12) 0%,transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              {/* FIX 4: Banner wraps on mobile */}
              <div className="cmp-banner">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    position: "relative",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span style={{ fontSize: "22px", flexShrink: 0 }}>💡</span>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "white",
                        marginBottom: "5px",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      AgriSense Recommendation
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "rgba(167,243,208,0.85)",
                        lineHeight: 1.65,
                      }}
                    >
                      Based on current predictions,{" "}
                      <strong style={{ color: "white" }}>
                        {bestPrice.crop}
                      </strong>{" "}
                      in{" "}
                      <strong style={{ color: "white" }}>
                        {bestPrice.state}
                      </strong>{" "}
                      offers the highest price at{" "}
                      <strong style={{ color: "white" }}>
                        ₹{Math.round(bestPrice.price).toLocaleString()}/quintal
                      </strong>
                      .{" "}
                      {bestConfidence && bestConfidence.crop !== bestPrice.crop
                        ? `For highest prediction accuracy, consider ${bestConfidence.crop} with ${bestConfidence.confidence}% confidence.`
                        : `It also has the highest model confidence at ${bestConfidence?.confidence}%.`}
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexShrink: 0,
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "14px",
                    border: "1px solid rgba(253,224,71,0.3)",
                    boxShadow: "0 0 20px rgba(253,224,71,0.15)",
                    padding: "10px 16px",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <TrendingUp
                    style={{ width: "20px", height: "20px", color: "#fde047" }}
                  />
                  <span
                    style={{
                      color: "#fde047",
                      fontWeight: 800,
                      fontSize: "16px",
                      fontFamily: "'DM Mono',monospace",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    +
                    {(
                      (bestPrice.price / (bestPrice.price * 0.91) - 1) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Empty state ── */}
      {!loaded && !loading && (
        <Card
          isDark={isDark}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          style={{ padding: "64px", textAlign: "center" }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <GitCompare
              style={{ width: "24px", height: "24px", color: "#34d399" }}
            />
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: text,
              marginBottom: "8px",
              letterSpacing: "-0.01em",
            }}
          >
            Select crops and click Compare
          </div>
          <div style={{ fontSize: "13px", color: muted }}>
            Compare up to 5 crops side-by-side with price predictions,
            forecasts, and profiles
          </div>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  BarChart3,
  Activity,
  Globe,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CACHE_TTL = 5 * 60 * 1000;

const CROP_COLORS = {
  Wheat: "#34d399",
  Rice: "#60a5fa",
  Tomato: "#fb923c",
  Onion: "#e879f9",
  Cotton: "#22d3ee",
  Maize: "#fbbf24",
  Soyabean: "#a78bfa",
};

const TIME_TABS = ["3M", "6M", "12M"];
const TIME_MONTHS = { "3M": 3, "6M": 6, "12M": 12 };
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function useInView(threshold = 0.1) {
  const ref = useRef();
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function useCountUp(target, duration = 1400, enabled = true) {
  const [val, setVal] = useState(0);
  const rafRef = useRef();
  useEffect(() => {
    if (!enabled) return;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, "")) || 0;
    if (!num) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * num));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else setVal(num);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled]);
  return val;
}

function useBreakpoint() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

function GlowStatCard({
  label,
  value,
  change,
  up,
  sub,
  glowColor,
  icon: Icon,
  isDark,
  delay = 0,
}) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  const isRupee = String(value).startsWith("₹");
  const num = isRupee
    ? parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0
    : 0;
  const counted = useCountUp(num, 1400, inView && isRupee);
  const displayVal = isRupee ? `₹${counted.toLocaleString("en-IN")}` : value;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        background: isDark
          ? "rgba(30,41,59,0.8)"
          : "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
        borderRadius: "20px",
        padding: "20px 22px",
        border: `1px solid ${hovered ? glowColor + "55" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: hovered
          ? `0 0 0 1px ${glowColor}30, 0 8px 40px rgba(0,0,0,0.4), 0 0 60px ${glowColor}18`
          : isDark
            ? "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        animation: `popIn 0.55s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-30px",
          right: "-20px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: `radial-gradient(circle,${glowColor}22 0%,transparent 70%)`,
          pointerEvents: "none",
          transform: hovered ? "scale(1.5)" : "scale(1)",
          transition: "transform 0.4s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "15%",
          right: "15%",
          height: "1px",
          background: `linear-gradient(90deg,transparent,${glowColor}60,transparent)`,
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 0.3s",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "11px",
              color: isDark ? "#94a3b8" : "#4b5563",
              fontWeight: 700,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            {label}
          </p>
          <h3
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: isDark ? "#f0f4ff" : "#0f172a",
              margin: "7px 0 3px",
              letterSpacing: "-0.03em",
              fontFamily: isRupee ? "'DM Mono',monospace" : "inherit",
              textShadow:
                hovered && isDark ? `0 0 20px ${glowColor}40` : "none",
              transition: "text-shadow 0.3s",
            }}
          >
            {displayVal}
          </h3>
          <p
            style={{
              fontSize: "11px",
              color: isDark ? "#94a3b8" : "#4b5563",
              margin: 0,
              fontWeight: 500,
            }}
          >
            {sub}
          </p>
        </div>
        <div
          style={{
            background: hovered ? `${glowColor}25` : `${glowColor}15`,
            border: `1px solid ${hovered ? glowColor + "50" : glowColor + "30"}`,
            borderRadius: "14px",
            padding: "10px",
            boxShadow: hovered ? `0 0 20px ${glowColor}30` : "none",
            transition: "all 0.25s ease",
            flexShrink: 0,
          }}
        >
          <Icon
            style={{
              width: "18px",
              height: "18px",
              color: glowColor,
              filter: hovered ? `drop-shadow(0 0 6px ${glowColor})` : "none",
              transition: "filter 0.25s",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background:
              up === true
                ? "rgba(52,211,153,0.1)"
                : up === false
                  ? "rgba(248,113,113,0.1)"
                  : "rgba(251,191,36,0.1)",
            border: `1px solid ${up === true ? "rgba(52,211,153,0.2)" : up === false ? "rgba(248,113,113,0.2)" : "rgba(251,191,36,0.2)"}`,
            borderRadius: "20px",
            padding: "3px 8px",
          }}
        >
          {up === true && <ArrowUpRight size={12} color="#34d399" />}
          {up === false && <ArrowDownRight size={12} color="#f87171" />}
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color:
                up === true ? "#34d399" : up === false ? "#f87171" : "#fbbf24",
            }}
          >
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

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
            style={{ color: "#94a3b8", fontSize: "11px", minWidth: "52px" }}
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
            {typeof p.value === "number" ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

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

export default function Analytics() {
  const { isDark } = useTheme();
  const isMobile = useBreakpoint();

  const [activeCrop, setActiveCrop] = useState("All");
  const [activeTime, setActiveTime] = useState("6M");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastFetch, setLastFetch] = useState(null);
  const cache = useRef({});

  const fetchSummary = useCallback(async (months, force = false) => {
    const key = String(months);
    setError("");
    if (!force && cache.current[key]) {
      const age = Date.now() - cache.current[key].ts;
      if (age < CACHE_TTL) {
        setData(cache.current[key].data);
        setLastFetch(new Date(cache.current[key].ts));
        setLoading(false);
        return;
      }
    }
    setLoading(true);
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 45000);
      const res = await fetch(
        `${API_BASE}/analytics/summary?months=${months}`,
        { signal: ctrl.signal },
      );
      clearTimeout(tid);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      cache.current[key] = { data: json, ts: Date.now() };
      setData(json);
      setError("");
      setLastFetch(new Date());
    } catch (err) {
      if (err.name === "AbortError")
        setError(
          "Request timed out — make sure your backend is running on port 8000.",
        );
      else if (err.message?.includes("503")) {
        setError("⏳ Model is warming up (~60s). Auto-retrying...");
        setTimeout(() => fetchSummary(months, true), 15000);
      } else if (err.message?.includes("Failed to fetch"))
        setError("Backend offline — start it with: uvicorn main:app --reload");
      else setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(TIME_MONTHS[activeTime]);
  }, [activeTime]);

  const dashboard = data?.dashboard || [];
  const allCrops = data?.crops || Object.keys(CROP_COLORS);
  const trendData = data?.trend || [];
  const radarData = data?.radar || [];
  const regionData = data?.regional || [];
  const volatilityData = data?.history || [];
  const visibleCrops = activeCrop === "All" ? allCrops : [activeCrop];

  const avgPrice = dashboard.length
    ? Math.round(
        dashboard.reduce((s, d) => s + d.predicted_price, 0) / dashboard.length,
      )
    : null;
  const mostVolatile = [...dashboard].sort(
    (a, b) =>
      (b.max_price - b.min_price) / b.predicted_price -
      (a.max_price - a.min_price) / a.predicted_price,
  )[0];
  const bestConf = [...dashboard].sort(
    (a, b) => b.confidence - a.confidence,
  )[0];
  const lowestP = [...dashboard].sort(
    (a, b) => a.predicted_price - b.predicted_price,
  )[0];

  const statCards = dashboard.length
    ? [
        {
          label: "Avg Market Price",
          value: fmt(avgPrice),
          change: "+8.3%",
          up: true,
          sub: "Across all crops",
          glowColor: "#34d399",
          icon: BarChart3,
        },
        {
          label: "Most Volatile",
          value: mostVolatile?.crop || "—",
          change: `±${Math.round(((mostVolatile?.max_price - mostVolatile?.min_price) / mostVolatile?.predicted_price) * 100)}%`,
          up: null,
          sub: "Price swing range",
          glowColor: "#fbbf24",
          icon: Activity,
        },
        {
          label: "Best Confidence",
          value: bestConf?.crop || "—",
          change: `${bestConf?.confidence || 0}%`,
          up: true,
          sub: "Model accuracy",
          glowColor: "#60a5fa",
          icon: Zap,
        },
        {
          label: "Lowest Price",
          value: lowestP?.crop || "—",
          change: fmt(lowestP?.predicted_price || 0),
          up: false,
          sub: "Current prediction",
          glowColor: "#f87171",
          icon: Globe,
        },
      ]
    : [];

  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const text = isDark ? "#e8edf8" : "#0f172a";
  const muted = isDark ? "#94a3b8" : "#4b5563";
  const cardShadow = isDark
    ? "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
    : "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)";
  const gridC = isDark ? "rgba(255,255,255,0.04)" : "#f0f0f0";

  const TabBtn = ({ label, active, onClick, color = "#34d399" }) => (
    <button
      onClick={onClick}
      style={{
        padding: "5px 11px",
        borderRadius: "8px",
        fontSize: "11px",
        fontWeight: 700,
        border: "none",
        cursor: "pointer",
        transition: "all 0.15s",
        background: active ? color : "transparent",
        color: active ? (isDark ? "#071a0e" : "white") : muted,
        boxShadow: active ? `0 0 10px ${color}40` : "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  const Skeleton = ({ h = 20, w = "100%" }) => (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: 10,
        background: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
        animation: "skpulse 1.4s ease infinite",
      }}
    />
  );

  const ChartWrap = ({ children, empty }) =>
    loading ? (
      <Skeleton h="100%" />
    ) : empty ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: muted,
          fontSize: 13,
        }}
      >
        No data
      </div>
    ) : (
      children
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <style>{`
        @keyframes skpulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { 0%{opacity:0;transform:scale(0.92) translateY(10px)} 60%{transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .an-fade-1 { animation: fadeUp 0.45s 0.00s ease both; }
        .an-fade-2 { animation: fadeUp 0.45s 0.07s ease both; }
        .an-fade-3 { animation: fadeUp 0.45s 0.14s ease both; }
        .an-fade-4 { animation: fadeUp 0.45s 0.21s ease both; }
        .an-fade-5 { animation: fadeUp 0.45s 0.28s ease both; }
        .pulse-dot { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
        .table-row { transition: background 0.15s; }
        .table-row:hover { background: ${isDark ? "rgba(52,211,153,0.04)" : "#f0fdf4"} !important; }
        .refresh-btn { transition: all 0.18s ease; }
        .refresh-btn:hover:not(:disabled) { background: ${isDark ? "rgba(52,211,153,0.1)" : "#f0fdf4"} !important; border-color: rgba(52,211,153,0.3) !important; color: #34d399 !important; }

        /* ── Responsive grids ── */
        .an-stat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 16px;
        }
        .an-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }
        .an-crop-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }
        .an-trend-controls {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .an-table-wrap {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 640px) {
          .an-stat-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
          .an-bottom-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .an-trend-controls {
            justify-content: flex-start !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <div
        className="an-fade-1"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: text,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Market Analytics
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: muted,
              marginTop: "4px",
              fontWeight: 400,
            }}
          >
            Price trends, regional insights &amp; crop performance overview
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {lastFetch && !loading && (
            <span style={{ fontSize: "11px", color: muted }}>
              Updated {lastFetch.toLocaleTimeString()}
            </span>
          )}
          <button
            className="refresh-btn"
            onClick={() => fetchSummary(TIME_MONTHS[activeTime], true)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: "12px",
              border: `1px solid ${cardBorder}`,
              background: isDark ? "rgba(30,41,59,0.8)" : "white",
              color: text,
              fontSize: "13px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              boxShadow: cardShadow,
            }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: isDark ? "rgba(248,113,113,0.08)" : "#fef2f2",
            border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: "12px",
            padding: "12px 16px",
            color: "#f87171",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* STAT CARDS */}
      <div className="an-fade-2 an-stat-grid">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: isDark ? "rgba(30,41,59,0.8)" : "white",
                    borderRadius: "20px",
                    border: `1px solid ${cardBorder}`,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <Skeleton h={11} w="55%" />
                  <Skeleton h={24} w="75%" />
                  <Skeleton h={10} w="45%" />
                </div>
              ))
          : statCards.map((c, i) => (
              <GlowStatCard
                key={c.label}
                {...c}
                isDark={isDark}
                delay={i * 80}
              />
            ))}
      </div>

      {/* TREND CHART */}
      <Card
        isDark={isDark}
        cardBorder={cardBorder}
        cardShadow={cardShadow}
        className="an-fade-3"
        style={{
          padding: "22px 22px 12px",
          height: isMobile ? "420px" : "360px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
            flexShrink: 0,
            position: "relative",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: text,
                  letterSpacing: "-0.02em",
                }}
              >
                Price Trend Analysis
              </span>
              <span
                style={{
                  fontSize: "10px",
                  background: isDark ? "rgba(52,211,153,0.1)" : "#dcfce7",
                  color: "#34d399",
                  padding: "3px 9px",
                  borderRadius: "20px",
                  fontWeight: 700,
                  border: "1px solid rgba(52,211,153,0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  className="pulse-dot"
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#34d399",
                    display: "inline-block",
                  }}
                />
                ML Forecast
              </span>
            </div>
            <div style={{ fontSize: "11px", color: muted, marginTop: "2px" }}>
              ₹ per quintal · forecast
            </div>
          </div>

          {/* Controls — stack on mobile */}
          <div className="an-trend-controls">
            {/* Crop tabs — scrollable on mobile */}
            <div
              style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                maxWidth: isMobile ? "100%" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  background: isDark ? "rgba(0,0,0,0.3)" : "#f1f5f9",
                  borderRadius: "12px",
                  padding: "3px",
                  gap: "2px",
                  border: `1px solid ${cardBorder}`,
                  width: "max-content",
                }}
              >
                <TabBtn
                  label="All"
                  active={activeCrop === "All"}
                  onClick={() => setActiveCrop("All")}
                />
                {allCrops.map((c) => (
                  <TabBtn
                    key={c}
                    label={c}
                    active={activeCrop === c}
                    onClick={() => setActiveCrop(c)}
                    color={CROP_COLORS[c] || "#34d399"}
                  />
                ))}
              </div>
            </div>
            {/* Time tabs */}
            <div
              style={{
                display: "flex",
                background: isDark ? "rgba(0,0,0,0.3)" : "#f1f5f9",
                borderRadius: "12px",
                padding: "3px",
                gap: "2px",
                border: `1px solid ${cardBorder}`,
                flexShrink: 0,
              }}
            >
              {TIME_TABS.map((t) => (
                <TabBtn
                  key={t}
                  label={t}
                  active={activeTime === t}
                  onClick={() => {
                    setActiveTime(t);
                    fetchSummary(TIME_MONTHS[t]);
                  }}
                  color="#34d399"
                />
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: isMobile ? "260px" : 0,
            position: "relative",
          }}
        >
          <ChartWrap empty={!trendData.length}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridC}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: muted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: muted }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
                {visibleCrops.map((crop) => (
                  <Line
                    key={crop}
                    type="monotone"
                    dataKey={crop}
                    stroke={CROP_COLORS[crop] || "#34d399"}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: CROP_COLORS[crop], strokeWidth: 0 }}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                      stroke: (CROP_COLORS[crop] || "#34d399") + "60",
                    }}
                    name={crop}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartWrap>
        </div>
      </Card>

      {/* BOTTOM 3 CHARTS */}
      <div className="an-fade-4 an-bottom-grid">
        {/* Regional Bar */}
        <Card
          isDark={isDark}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          style={{
            padding: "22px",
            height: "320px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              marginBottom: "14px",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "3px",
              }}
            >
              <div
                style={{
                  background: isDark ? "rgba(52,211,153,0.1)" : "#f0fdf4",
                  border: "1px solid rgba(52,211,153,0.2)",
                  borderRadius: "8px",
                  padding: "6px",
                }}
              >
                <Globe
                  style={{ width: "13px", height: "13px", color: "#34d399" }}
                />
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: text,
                  letterSpacing: "-0.02em",
                }}
              >
                Avg Price by Region
              </span>
            </div>
            <div style={{ fontSize: "11px", color: muted }}>
              ₹ per quintal · live mandi data
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChartWrap empty={!regionData.length}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} layout="vertical" barSize={12}>
                  <defs>
                    <linearGradient id="barRegion" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#16a34a"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridC}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="region"
                    type="category"
                    tick={{ fontSize: 11, fill: muted }}
                    width={74}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="avgPrice"
                    fill="url(#barRegion)"
                    radius={[0, 8, 8, 0]}
                    name="Avg Price"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrap>
          </div>
        </Card>

        {/* Volatility */}
        <Card
          isDark={isDark}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          style={{
            padding: "22px",
            height: "320px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              marginBottom: "14px",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "3px",
              }}
            >
              <div
                style={{
                  background: isDark ? "rgba(251,191,36,0.1)" : "#fffbeb",
                  border: "1px solid rgba(251,191,36,0.2)",
                  borderRadius: "8px",
                  padding: "6px",
                }}
              >
                <Activity
                  style={{ width: "13px", height: "13px", color: "#fbbf24" }}
                />
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: text,
                  letterSpacing: "-0.02em",
                }}
              >
                Wheat Price Volatility
              </span>
            </div>
            <div style={{ fontSize: "11px", color: muted }}>
              High / Low / Average range
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChartWrap empty={!volatilityData.length}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volatilityData}>
                  <defs>
                    <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridC}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: muted }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="high"
                    stroke="#34d399"
                    strokeWidth={2}
                    fill="url(#highGrad)"
                    name="High"
                  />
                  <Area
                    type="monotone"
                    dataKey="avg"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    fill="transparent"
                    strokeDasharray="4 3"
                    name="Avg"
                  />
                  <Area
                    type="monotone"
                    dataKey="low"
                    stroke="#f87171"
                    strokeWidth={2}
                    fill="transparent"
                    name="Low"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrap>
          </div>
        </Card>

        {/* Radar */}
        <Card
          isDark={isDark}
          cardBorder={cardBorder}
          cardShadow={cardShadow}
          style={{
            padding: "22px",
            height: "320px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              marginBottom: "14px",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "3px",
              }}
            >
              <div
                style={{
                  background: isDark ? "rgba(96,165,250,0.1)" : "#eff6ff",
                  border: "1px solid rgba(96,165,250,0.2)",
                  borderRadius: "8px",
                  padding: "6px",
                }}
              >
                <BarChart3
                  style={{ width: "13px", height: "13px", color: "#60a5fa" }}
                />
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: text,
                  letterSpacing: "-0.02em",
                }}
              >
                Crop Performance Score
              </span>
            </div>
            <div style={{ fontSize: "11px", color: muted }}>
              This season vs last season
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChartWrap empty={!radarData.length}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid
                    stroke={isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}
                  />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: muted }}
                  />
                  <PolarRadiusAxis tick={{ fontSize: 9, fill: muted }} />
                  <Radar
                    name="This Season"
                    dataKey="A"
                    stroke="#34d399"
                    fill="#34d399"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Last Season"
                    dataKey="B"
                    stroke="#60a5fa"
                    fill="#60a5fa"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Tooltip content={<ChartTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartWrap>
          </div>
        </Card>
      </div>

      {/* REGIONAL TABLE */}
      <Card
        isDark={isDark}
        cardBorder={cardBorder}
        cardShadow={cardShadow}
        className="an-fade-5"
        style={{ padding: "22px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
            position: "relative",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "3px",
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
                <Globe
                  style={{ width: "14px", height: "14px", color: "#34d399" }}
                />
              </div>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: text,
                  letterSpacing: "-0.02em",
                }}
              >
                Regional Market Summary
              </span>
            </div>
            <div style={{ fontSize: "11px", color: muted }}>
              Live data from Indian agricultural mandis
            </div>
          </div>
          <span
            style={{
              fontSize: "10px",
              background: isDark ? "rgba(52,211,153,0.1)" : "#dcfce7",
              color: "#34d399",
              padding: "4px 10px",
              borderRadius: "20px",
              fontWeight: 700,
              border: "1px solid rgba(52,211,153,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span
              className="pulse-dot"
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#34d399",
                display: "inline-block",
              }}
            />
            Live
          </span>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} h={44} />
              ))}
          </div>
        ) : (
          /* Scrollable wrapper prevents table from busting layout on mobile */
          <div className="an-table-wrap">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "480px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                  }}
                >
                  {[
                    "Region",
                    "Avg Price (₹/qtl)",
                    "Market Volume",
                    "Growth",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 14px",
                        fontSize: "11px",
                        color: muted,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regionData.map(({ region, avgPrice, volume, growth }) => (
                  <tr
                    key={region}
                    className="table-row"
                    style={{
                      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}`,
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: text,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {region}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 800,
                        color: text,
                        fontFamily: "'DM Mono',monospace",
                        letterSpacing: "-0.02em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {avgPrice ? (
                        fmt(avgPrice)
                      ) : (
                        <span style={{ color: muted }}>—</span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: "13px",
                        color: muted,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {Number(volume).toLocaleString()} qtl
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        {growth >= 0 ? (
                          <TrendingUp size={13} color="#34d399" />
                        ) : (
                          <TrendingDown size={13} color="#f87171" />
                        )}
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: growth >= 0 ? "#34d399" : "#f87171",
                            fontFamily: "'DM Mono',monospace",
                          }}
                        >
                          {growth >= 0 ? "+" : ""}
                          {growth}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "4px 12px",
                          borderRadius: "20px",
                          background:
                            growth > 10
                              ? isDark
                                ? "rgba(52,211,153,0.12)"
                                : "#f0fdf4"
                              : growth > 0
                                ? isDark
                                  ? "rgba(251,191,36,0.12)"
                                  : "#fffbeb"
                                : isDark
                                  ? "rgba(248,113,113,0.12)"
                                  : "#fef2f2",
                          color:
                            growth > 10
                              ? "#34d399"
                              : growth > 0
                                ? "#fbbf24"
                                : "#f87171",
                          border: `1px solid ${growth > 10 ? "rgba(52,211,153,0.2)" : growth > 0 ? "rgba(251,191,36,0.2)" : "rgba(248,113,113,0.2)"}`,
                        }}
                      >
                        {growth > 10
                          ? "Bullish"
                          : growth > 0
                            ? "Stable"
                            : "Bearish"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

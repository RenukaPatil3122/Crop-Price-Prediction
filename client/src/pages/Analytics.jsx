import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
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

// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CACHE_TTL = 5 * 60 * 1000; // 5 min — don't re-fetch if data is fresh

const CROP_COLORS = {
  Wheat: "#16a34a",
  Rice: "#2563eb",
  Tomato: "#ea580c",
  Onion: "#9333ea",
  Cotton: "#0891b2",
  Maize: "#f59e0b",
  Soyabean: "#ec4899",
};

const TIME_TABS = ["3M", "6M", "12M"];
const TIME_MONTHS = { "3M": 3, "6M": 6, "12M": 12 };
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Analytics() {
  const { isDark } = useTheme();

  const [activeCrop, setActiveCrop] = useState("All");
  const [activeTime, setActiveTime] = useState("6M");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastFetch, setLastFetch] = useState(null);

  // Cache: { "6": { data, ts }, "3": {...}, "12": {...} }
  const cache = useRef({});

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchSummary = useCallback(async (months, force = false) => {
    const key = String(months);

    setError(""); // ← ADD THIS LINE HERE (before cache check)

    // Serve from cache if fresh enough
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
    setError("");

    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(
        `${API_BASE}/analytics/summary?months=${months}`,
        { signal: ctrl.signal },
      );
      clearTimeout(tid);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      cache.current[key] = { data: json, ts: Date.now() };
      setData(json);
      setLastFetch(new Date());
    } catch (err) {
      if (err.name === "AbortError") {
        setError(
          "Request timed out — make sure your backend is running on port 8000.",
        );
      } else if (err.message?.includes("503")) {
        setError("⏳ Model is training (~60s). Auto-retrying in 15s...");
        setTimeout(() => fetchSummary(months, true), 15000);
      } else {
        setError(`Backend error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(TIME_MONTHS[activeTime]);
  }, [activeTime]); // ← was []

  const handleTimeChange = (tab) => {
    setActiveTime(tab);
    fetchSummary(TIME_MONTHS[tab]); // uses cache if available
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

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
        },
        {
          label: "Most Volatile",
          value: mostVolatile?.crop || "—",
          change: `±${Math.round(((mostVolatile?.max_price - mostVolatile?.min_price) / mostVolatile?.predicted_price) * 100)}%`,
          up: null,
          sub: "Price swing range",
        },
        {
          label: "Best Confidence",
          value: bestConf?.crop || "—",
          change: `${bestConf?.confidence || 0}%`,
          up: true,
          sub: "Model confidence",
        },
        {
          label: "Lowest Price",
          value: lowestP?.crop || "—",
          change: fmt(lowestP?.predicted_price || 0),
          up: false,
          sub: "Current prediction",
        },
      ]
    : [];

  // ── Theme ───────────────────────────────────────────────────────────────────

  const card = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#f3f4f6";
  const text = isDark ? "#f1f5f9" : "#1f2937";
  const muted = isDark ? "#94a3b8" : "#6b7280";
  const faint = isDark ? "#64748b" : "#9ca3af";
  const bg2 = isDark ? "#0f172a" : "#f9fafb";
  const gridC = isDark ? "#334155" : "#F0F0F0";
  const tt = {
    borderRadius: "10px",
    border: `1px solid ${border}`,
    fontSize: "12px",
    background: card,
    color: text,
  };

  const TabBtn = ({ label, active, onClick, color = "#16a34a" }) => (
    <button
      onClick={onClick}
      style={{
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        transition: "all 0.15s",
        background: active ? color : "transparent",
        color: active ? "white" : muted,
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
        borderRadius: 8,
        background: isDark ? "#334155" : "#e5e7eb",
        animation: "skpulse 1.4s ease-in-out infinite",
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
          color: faint,
          fontSize: 13,
        }}
      >
        No data
      </div>
    ) : (
      children
    );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`@keyframes skpulse{0%,100%{opacity:1}50%{opacity:.45}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: text,
              margin: 0,
            }}
          >
            Market Analytics
          </h1>
          <p style={{ fontSize: "13px", color: faint, marginTop: "4px" }}>
            Price trends, regional insights &amp; crop performance overview
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastFetch && !loading && (
            <span style={{ fontSize: "11px", color: faint }}>
              Updated {lastFetch.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchSummary(TIME_MONTHS[activeTime], true)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: "10px",
              border: `1px solid ${border}`,
              background: card,
              color: text,
              fontSize: "13px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
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

      {/* Error */}
      {error && (
        <div
          style={{
            background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
            border: `1px solid ${isDark ? "rgba(239,68,68,0.3)" : "#fecaca"}`,
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#ef4444",
            fontSize: "13px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: card,
                    borderRadius: "14px",
                    border: `1px solid ${border}`,
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <Skeleton h={12} w="60%" />
                  <Skeleton h={24} w="80%" />
                  <Skeleton h={10} w="50%" />
                </div>
              ))
          : statCards.map(({ label, value, change, up, sub }) => (
              <div
                key={label}
                style={{
                  background: card,
                  borderRadius: "14px",
                  border: `1px solid ${border}`,
                  boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.07)",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: muted,
                    fontWeight: 500,
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: text,
                    marginBottom: "4px",
                  }}
                >
                  {value}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {up === true && <ArrowUpRight size={13} color="#16a34a" />}
                  {up === false && <ArrowDownRight size={13} color="#ef4444" />}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color:
                        up === true
                          ? "#16a34a"
                          : up === false
                            ? "#ef4444"
                            : "#f59e0b",
                    }}
                  >
                    {change}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: faint,
                      marginLeft: "2px",
                    }}
                  >
                    · {sub}
                  </span>
                </div>
              </div>
            ))}
      </div>

      {/* Trend Chart */}
      <div
        style={{
          background: card,
          borderRadius: "16px",
          border: `1px solid ${border}`,
          boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.07)",
          padding: "20px",
          height: "340px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: text }}>
              Price Trend Analysis
            </div>
            <div style={{ fontSize: "11px", color: faint }}>
              ₹ per quintal · ML forecast
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                background: bg2,
                borderRadius: "8px",
                padding: "3px",
                gap: "2px",
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
                  color={CROP_COLORS[c] || "#16a34a"}
                />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                background: bg2,
                borderRadius: "8px",
                padding: "3px",
                gap: "2px",
              }}
            >
              {TIME_TABS.map((t) => (
                <TabBtn
                  key={t}
                  label={t}
                  active={activeTime === t}
                  onClick={() => handleTimeChange(t)}
                  color={isDark ? "#334155" : "#1f2937"}
                />
              ))}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ChartWrap empty={!trendData.length}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridC} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: faint }} />
                <YAxis tick={{ fontSize: 11, fill: faint }} />
                <Tooltip
                  contentStyle={tt}
                  formatter={(v, n) => [
                    `₹${Number(v).toLocaleString("en-IN")}`,
                    n,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", color: muted }} />
                {visibleCrops.map((crop) => (
                  <Line
                    key={crop}
                    type="monotone"
                    dataKey={crop}
                    stroke={CROP_COLORS[crop] || "#16a34a"}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    name={crop}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartWrap>
        </div>
      </div>

      {/* Bottom 3 charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Regional Bar */}
        <div
          style={{
            background: card,
            borderRadius: "16px",
            border: `1px solid ${border}`,
            padding: "20px",
            height: "300px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: "12px", flexShrink: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: text }}>
              Avg Price by Region
            </div>
            <div style={{ fontSize: "11px", color: faint }}>
              ₹ per quintal · live mandi data
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChartWrap empty={!regionData.length}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} layout="vertical" barSize={14}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridC}
                    horizontal={false}
                  />
                  <XAxis type="number" tick={{ fontSize: 10, fill: faint }} />
                  <YAxis
                    dataKey="region"
                    type="category"
                    tick={{ fontSize: 11, fill: muted }}
                    width={72}
                  />
                  <Tooltip
                    contentStyle={tt}
                    formatter={(v) => [fmt(v), "Avg Price"]}
                  />
                  <Bar
                    dataKey="avgPrice"
                    fill="#16a34a"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrap>
          </div>
        </div>

        {/* Volatility */}
        <div
          style={{
            background: card,
            borderRadius: "16px",
            border: `1px solid ${border}`,
            padding: "20px",
            height: "300px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: "12px", flexShrink: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: text }}>
              Wheat Price Volatility
            </div>
            <div style={{ fontSize: "11px", color: faint }}>
              High / Low / Average range
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChartWrap empty={!volatilityData.length}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volatilityData}>
                  <defs>
                    <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#16a34a"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridC} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: faint }} />
                  <YAxis tick={{ fontSize: 10, fill: faint }} />
                  <Tooltip contentStyle={tt} formatter={(v) => [fmt(v), ""]} />
                  <Area
                    type="monotone"
                    dataKey="high"
                    stroke="#16a34a"
                    strokeWidth={1.5}
                    fill="url(#highGrad)"
                    name="High"
                  />
                  <Area
                    type="monotone"
                    dataKey="avg"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="transparent"
                    strokeDasharray="4 3"
                    name="Avg"
                  />
                  <Area
                    type="monotone"
                    dataKey="low"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    fill="transparent"
                    name="Low"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrap>
          </div>
        </div>

        {/* Radar */}
        <div
          style={{
            background: card,
            borderRadius: "16px",
            border: `1px solid ${border}`,
            padding: "20px",
            height: "300px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: "12px", flexShrink: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: text }}>
              Crop Performance Score
            </div>
            <div style={{ fontSize: "11px", color: faint }}>
              This season vs last season
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChartWrap empty={!radarData.length}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={isDark ? "#334155" : "#e5e7eb"} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: muted }}
                  />
                  <PolarRadiusAxis tick={{ fontSize: 9, fill: faint }} />
                  <Radar
                    name="This Season"
                    dataKey="A"
                    stroke="#16a34a"
                    fill="#16a34a"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Last Season"
                    dataKey="B"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", color: muted }} />
                  <Tooltip contentStyle={tt} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartWrap>
          </div>
        </div>
      </div>

      {/* Regional Table */}
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
            fontSize: "15px",
            fontWeight: 700,
            color: text,
            marginBottom: "16px",
          }}
        >
          Regional Market Summary
        </div>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} h={40} />
              ))}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${border}` }}>
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
                      padding: "8px 12px",
                      fontSize: "12px",
                      color: faint,
                      fontWeight: 600,
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
                  style={{ borderBottom: `1px solid ${border}` }}
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: text,
                    }}
                  >
                    {region}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: text,
                    }}
                  >
                    {avgPrice ? (
                      fmt(avgPrice)
                    ) : (
                      <span style={{ color: faint }}>—</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: "13px",
                      color: muted,
                    }}
                  >
                    {Number(volume).toLocaleString()} qtl
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      {growth >= 0 ? (
                        <TrendingUp size={13} color="#16a34a" />
                      ) : (
                        <TrendingDown size={13} color="#ef4444" />
                      )}
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: growth >= 0 ? "#16a34a" : "#ef4444",
                        }}
                      >
                        {growth >= 0 ? "+" : ""}
                        {growth}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "20px",
                        background:
                          growth > 10
                            ? isDark
                              ? "rgba(22,163,74,0.15)"
                              : "#f0fdf4"
                            : growth > 0
                              ? isDark
                                ? "rgba(245,158,11,0.15)"
                                : "#fffbeb"
                              : isDark
                                ? "rgba(239,68,68,0.15)"
                                : "#fef2f2",
                        color:
                          growth > 10
                            ? "#16a34a"
                            : growth > 0
                              ? "#d97706"
                              : "#ef4444",
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
        )}
      </div>
    </div>
  );
}

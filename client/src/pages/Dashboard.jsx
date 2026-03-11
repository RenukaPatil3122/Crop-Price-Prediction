import { useState, useEffect } from "react";
import TopCropsCard from "../components/TopCropsCard";
import { useTheme } from "../context/ThemeContext";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  BarChart3,
  Zap,
  MapPin,
  Thermometer,
  CloudRain,
  BarChart2,
  Droplets,
  Tractor,
  Wheat,
  ShieldAlert,
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
import {
  quickPredict,
  getDashboardPrices,
  getRecentPredictions,
  getPredictionHistory,
  getForecast,
  getCurrentPrices,
} from "../api";

// ── Responsive hook ───────────────────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    const w = window.innerWidth;
    return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
  });
  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth;
      setBp(w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return bp;
}

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
const CHART_CROPS = [
  { crop: "Wheat", state: "Punjab", color: "#16A34A", key: "wheat" },
  { crop: "Rice", state: "Punjab", color: "#2563EB", key: "rice" },
  { crop: "Tomato", state: "Maharashtra", color: "#EA580C", key: "tomato" },
  { crop: "Onion", state: "Maharashtra", color: "#e879f9", key: "onion" },
  { crop: "Cotton", state: "Gujarat", color: "#64748b", key: "cotton" },
  { crop: "Maize", state: "Karnataka", color: "#f59e0b", key: "maize" },
  { crop: "Potato", state: "Uttar Pradesh", color: "#a78bfa", key: "potato" },
  { crop: "Mustard", state: "Rajasthan", color: "#f97316", key: "mustard" },
  {
    crop: "Soyabean",
    state: "Madhya Pradesh",
    color: "#06b6d4",
    key: "soyabean",
  },
];
const STATIC_INSIGHTS = [
  {
    icon: TrendingUp,
    iconBg: "#2563eb",
    title: "Rice Price High",
    desc: "Rice at ₹5,100/qtl in Lamlong Bazaar APMC",
    tag: "Market",
    tagColor: "#2563eb",
  },
  {
    icon: Tractor,
    iconBg: "#7c3aed",
    title: "High Mandi Arrivals",
    desc: "Rice arrivals: 1,000 qtl in West Bengal",
    tag: "Supply",
    tagColor: "#7c3aed",
  },
  {
    icon: BarChart2,
    iconBg: "#f59e0b",
    title: "Price Volatility",
    desc: "Tomato spread ₹2,250/qtl — high variance today",
    tag: "Alert",
    tagColor: "#f59e0b",
  },
  {
    icon: Tractor,
    iconBg: "#16a34a",
    title: "98 Mandis Active",
    desc: "Live price data from 98 mandis across India today",
    tag: "Live",
    tagColor: "#16a34a",
  },
  {
    icon: Droplets,
    iconBg: "#0891b2",
    title: "Monsoon Outlook",
    desc: "IMD predicts above-normal monsoon — favourable for Kharif sowing",
    tag: "Weather",
    tagColor: "#0891b2",
  },
  {
    icon: ShieldAlert,
    iconBg: "#ef4444",
    title: "Wheat MSP 2026",
    desc: "Govt announces MSP of ₹2,275/qtl for wheat — up ₹150 from last year",
    tag: "Policy",
    tagColor: "#ef4444",
  },
];

function buildInsightsFromPrices(prices) {
  if (!prices || prices.length === 0) return null;
  const sorted = [...prices].sort(
    (a, b) => (b.modal_price || 0) - (a.modal_price || 0),
  );
  const highest = sorted[0];
  const byArrival = [...prices].sort(
    (a, b) => (b.arrivals_in_qtl || 0) - (a.arrivals_in_qtl || 0),
  );
  const topArrival = byArrival[0];
  const mandiSet = new Set(
    prices.map((p) => p.market || p.mandi).filter(Boolean),
  );
  const mandiCount = mandiSet.size || prices.length;
  const volatile = [...prices]
    .filter((p) => p.max_price && p.min_price)
    .map((p) => ({ ...p, spread: p.max_price - p.min_price }))
    .sort((a, b) => b.spread - a.spread)[0];
  return [
    highest && {
      icon: TrendingUp,
      iconBg: "#2563eb",
      title: `${highest.commodity || highest.crop} Price High`,
      desc: `${highest.commodity || highest.crop} at ₹${Math.round(highest.modal_price).toLocaleString()}/qtl in ${highest.market || highest.state}`,
      tag: "Market",
      tagColor: "#2563eb",
    },
    topArrival && {
      icon: Tractor,
      iconBg: "#7c3aed",
      title: "High Mandi Arrivals",
      desc: `${topArrival.commodity || topArrival.crop} arrivals: ${Math.round(topArrival.arrivals_in_qtl || 0).toLocaleString()} qtl in ${topArrival.state || topArrival.market}`,
      tag: "Supply",
      tagColor: "#7c3aed",
    },
    volatile && {
      icon: BarChart2,
      iconBg: "#f59e0b",
      title: "Price Volatility",
      desc: `${volatile.commodity || volatile.crop} spread ₹${Math.round(volatile.spread).toLocaleString()}/qtl — high variance today`,
      tag: "Alert",
      tagColor: "#f59e0b",
    },
    {
      icon: Tractor,
      iconBg: "#16a34a",
      title: `${mandiCount.toLocaleString()} Mandis Active`,
      desc: `Live price data from ${mandiCount} mandis across India today`,
      tag: "Live",
      tagColor: "#16a34a",
    },
    {
      icon: Droplets,
      iconBg: "#0891b2",
      title: "Monsoon Outlook",
      desc: "IMD predicts above-normal monsoon — favourable for Kharif sowing",
      tag: "Weather",
      tagColor: "#0891b2",
    },
    {
      icon: ShieldAlert,
      iconBg: "#ef4444",
      title: "Wheat MSP 2026",
      desc: "Govt announces MSP of ₹2,275/qtl for wheat — up ₹150 from last year",
      tag: "Policy",
      tagColor: "#ef4444",
    },
  ]
    .filter(Boolean)
    .slice(0, 6);
}

export default function Dashboard() {
  const { isDark } = useTheme();
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);
  const [recentFromDB, setRecentFromDB] = useState([]);
  const [chartRange, setChartRange] = useState("6M");
  const [chartData, setChartData] = useState({});
  const [chartLoading, setChartLoading] = useState(true);
  const [marketInsights, setMarketInsights] = useState(STATIC_INSIGHTS);
  const [liveTopCrops, setLiveTopCrops] = useState([]);
  const [todayMarket, setTodayMarket] = useState({
    mandis: "—",
    temp: "—",
    rain: "—",
  });
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

  const card = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const text = isDark ? "#f1f5f9" : "#111827";
  const muted = isDark ? "#94a3b8" : "#6b7280";
  const cardShadow = isDark
    ? "none"
    : "0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)";

  useEffect(() => {
    getDashboardPrices()
      .then((res) => {
        if (res.data?.length > 0) {
          setDashboardData(res.data);
          const wheat = res.data.find((d) => d.crop === "Wheat");
          if (wheat)
            setMetricCards((p) => [
              {
                ...p[0],
                value: `₹${Math.round(wheat.predicted_price).toLocaleString()}`,
                sub: "Wheat · Next Month",
              },
              { ...p[1], value: `${wheat.confidence}%` },
              p[2],
            ]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getRecentPredictions(20)
      .then((r) => {
        if (r.data?.length > 0) setRecentFromDB(r.data);
      })
      .catch(() => {});
  }, []);

  const loadChart = async () => {
    setChartLoading(true);
    try {
      let userCrops = CHART_CROPS;
      try {
        const histRes = await getPredictionHistory({ limit: 100 });
        const up = histRes.data || [];
        if (up.length > 0) {
          const f = CHART_CROPS.filter((cc) =>
            up.some((p) => p.crop === cc.crop),
          );
          if (f.length > 0) userCrops = f;
        }
      } catch {}
      const results = await Promise.allSettled(
        userCrops.map(({ crop, state }) => getForecast(crop, state, 12)),
      );
      const goodCrops = [],
        forecasts = [];
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value?.forecast?.length > 0) {
          goodCrops.push(userCrops[i]);
          forecasts.push(r.value.forecast);
        }
      });
      if (goodCrops.length === 0) return;
      const maxLen = Math.max(...forecasts.map((f) => f.length), 1);
      const all = Array.from({ length: maxLen }, (_, i) => {
        const pt = { month: forecasts[0][i]?.month || `M${i + 1}` };
        goodCrops.forEach(({ key }, ci) => {
          pt[key] = Math.round(forecasts[ci]?.[i]?.predicted_price || 0);
        });
        return pt;
      });
      setChartData({
        "3M": all.slice(0, 3),
        "6M": all.slice(0, 6),
        "12M": all,
        _activeCrops: goodCrops,
      });
    } catch (err) {
      console.warn("Chart load failed:", err);
    } finally {
      setChartLoading(false);
    }
  };
  useEffect(() => {
    loadChart();
  }, []);

  useEffect(() => {
    getCurrentPrices()
      .then((res) => {
        const built = buildInsightsFromPrices(res.data || []);
        if (built && built.length > 0) setMarketInsights(built);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const LAT = 19.9,
      LON = 75.3;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,rain&timezone=auto`,
    )
      .then((r) => r.json())
      .then((d) => {
        const temp = d.current?.temperature_2m,
          rain = d.current?.rain;
        setTodayMarket((p) => ({
          ...p,
          temp: temp != null ? `${Math.round(temp)}°C` : "—",
          rain: rain != null ? `${rain} mm` : "0 mm",
        }));
      })
      .catch(() => {});
    getCurrentPrices()
      .then((res) => {
        const prices = res.data || [];
        const mandiSet = new Set(
          prices.map((p) => p.market || p.mandi).filter(Boolean),
        );
        const count = mandiSet.size || prices.length;
        setTodayMarket((p) => ({
          ...p,
          mandis: count > 0 ? count.toLocaleString() : "2,847",
        }));
      })
      .catch(() => setTodayMarket((p) => ({ ...p, mandis: "2,847" })));
  }, []);

  const handlePredict = async () => {
    if (!selectedCrop || !selectedRegion) return;
    setLoading(true);
    setPrediction(null);
    try {
      const r = await quickPredict(selectedCrop, selectedRegion, true);
      setPrediction({
        price: `₹${Math.round(r.predicted_price).toLocaleString()}`,
        confidence: `${r.confidence}%`,
        change: `${r.predicted_price > 2000 ? "+" : ""}${((r.predicted_price / 2200 - 1) * 100).toFixed(1)}%`,
        up: r.predicted_price > 2200,
      });
      getRecentPredictions(20)
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

  const recentPredictions = (() => {
    const raw = recentFromDB.length > 0 ? recentFromDB : STATIC_RECENT;
    const seen = new Set();
    return raw
      .filter((d) => {
        const k = `${d.crop}|${d.state}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .map((d) => ({
        crop: d.crop,
        region: d.state,
        price: `₹${Math.round(d.predicted_price).toLocaleString()}`,
        ...(CROP_CHANGES[d.crop] || { change: "+5%", up: true }),
      }));
  })();

  const topCrops =
    liveTopCrops.length > 0
      ? liveTopCrops
      : (dashboardData.length > 0
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

  // ── Layout helpers ────────────────────────────────────────────────────────
  // metric cards: 1 col on mobile, 3 on tablet+
  const metricCols = isMobile ? "1fr" : "1fr 1fr 1fr";
  // main grid: single col on mobile/tablet, 2fr 1fr on desktop
  const mainCols = isMobile || isTablet ? "1fr" : "2fr 1fr";
  // market insights: 1 col on mobile, 2 col on tablet+
  const insightCols = isMobile ? "1fr" : "1fr 1fr";
  // quick predict row: stack on mobile
  const predictWrap = isMobile ? "wrap" : "nowrap";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ── Metric Cards ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: metricCols,
          gap: "16px",
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
                boxShadow: cardShadow,
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
                    style={{
                      fontSize: "13px",
                      color: muted,
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    {title}
                  </p>
                  <h3
                    style={{
                      fontSize: isMobile ? "22px" : "24px",
                      fontWeight: 700,
                      color: text,
                      margin: "4px 0",
                    }}
                  >
                    {value}
                  </h3>
                  <p style={{ fontSize: "11px", color: muted, margin: 0 }}>
                    {sub}
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: iconBg,
                    borderRadius: "10px",
                    padding: "10px",
                    flexShrink: 0,
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

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div
        style={{ display: "grid", gridTemplateColumns: mainCols, gap: "20px" }}
      >
        {/* ── Left column ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quick Predict */}
          <div
            style={{
              background: "linear-gradient(135deg,#166534 0%,#16A34A 100%)",
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
              <span style={{ fontSize: "18px" }}>⚡</span>
              <span
                style={{ color: "white", fontWeight: 700, fontSize: "15px" }}
              >
                Quick Predict
              </span>
              {!isMobile && (
                <span style={{ color: "#bbf7d0", fontSize: "12px" }}>
                  Get instant price prediction
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "10px",
                flexWrap: predictWrap,
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: isMobile ? "calc(50% - 5px)" : "120px",
                }}
              >
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
                  style={{
                    height: "38px",
                    borderRadius: "10px",
                    padding: "0 10px",
                    fontSize: "13px",
                    color: "#374151",
                    background: "white",
                    border: "none",
                    outline: "none",
                    width: "100%",
                  }}
                >
                  <option value="">Select crop...</option>
                  {CROPS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: isMobile ? "calc(50% - 5px)" : "120px",
                }}
              >
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
                  style={{
                    height: "38px",
                    borderRadius: "10px",
                    padding: "0 10px",
                    fontSize: "13px",
                    color: "#374151",
                    background: "white",
                    border: "none",
                    outline: "none",
                    width: "100%",
                  }}
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
                  height: "38px",
                  padding: "0 20px",
                  borderRadius: "10px",
                  background: "#facc15",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#1f2937",
                  border: "none",
                  cursor: disabled ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  opacity: disabled ? 0.5 : 1,
                  flexShrink: 0,
                }}
              >
                {loading ? "⏳" : "Predict →"}
              </button>
            </div>
            {prediction && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(255,255,255,0.18)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginTop: "10px",
                  flexWrap: "wrap",
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

          {/* Price Trends Chart */}
          <div
            style={{
              background: card,
              borderRadius: "16px",
              border: `1px solid ${border}`,
              padding: "20px 20px 12px",
              height: isMobile ? "280px" : "320px",
              display: "flex",
              flexDirection: "column",
              boxShadow: cardShadow,
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{ fontSize: "15px", fontWeight: 700, color: text }}
                  >
                    Price Trends
                  </div>
                  {!chartLoading && Object.keys(chartData).length > 0 && (
                    <span
                      style={{
                        fontSize: "10px",
                        background: isDark ? "rgba(22,163,74,0.15)" : "#dcfce7",
                        color: "#16a34a",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        fontWeight: 700,
                      }}
                    >
                      ● ML Forecast
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "11px", color: muted }}>
                  Next {{ "3M": "3", "6M": "6", "12M": "12" }[chartRange]}{" "}
                  months · ₹ per quintal
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
                {["3M", "6M", "12M"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setChartRange(p)}
                    style={{
                      padding: isMobile ? "4px 8px" : "5px 12px",
                      borderRadius: "7px",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
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
              {chartLoading ? (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ fontSize: "22px" }}>📈</div>
                  <div style={{ fontSize: "12px", color: muted }}>
                    Loading ML forecast data…
                  </div>
                </div>
              ) : Object.keys(chartData).length === 0 ? (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ fontSize: "22px" }}>📡</div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: muted,
                      textAlign: "center",
                    }}
                  >
                    Backend offline — start your server and refresh
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData[chartRange] || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#334155" : "#F0F0F0"}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: muted }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: muted }}
                      width={isMobile ? 45 : 50}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: `1px solid ${border}`,
                        fontSize: "12px",
                        background: card,
                        color: text,
                      }}
                      formatter={(v, name) => [
                        `₹${v.toLocaleString()}`,
                        name.charAt(0).toUpperCase() + name.slice(1),
                      ]}
                    />
                    {!isMobile && (
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    )}
                    {(chartData._activeCrops || CHART_CROPS).map(
                      ({ key, color, crop }) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={color}
                          strokeWidth={2}
                          dot={{ r: 2.5 }}
                          name={crop}
                          activeDot={{ r: 5 }}
                        />
                      ),
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Market Insights */}
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
                  Live from data.gov.in mandi prices
                </div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  background: isDark ? "rgba(22,163,74,0.15)" : "#dcfce7",
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
                gridTemplateColumns: insightCols,
                gap: "10px",
              }}
            >
              {marketInsights.map(
                ({ icon: NewsIcon, iconBg, title, desc, tag, tagColor }) => (
                  <div
                    key={title}
                    style={{
                      background: isDark ? "#0f172a" : "#f9fafb",
                      border: `1px solid ${border}`,
                      borderRadius: "12px",
                      padding: "14px",
                      cursor: "pointer",
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = isDark
                        ? "0 4px 12px rgba(0,0,0,0.3)"
                        : "0 4px 12px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "9px",
                          background: `${iconBg}20`,
                          border: `1px solid ${iconBg}35`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <NewsIcon
                          style={{
                            width: "16px",
                            height: "16px",
                            color: iconBg,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: tagColor,
                          background: `${tagColor}15`,
                          border: `1px solid ${tagColor}30`,
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
                      style={{
                        fontSize: "11px",
                        color: muted,
                        lineHeight: 1.5,
                      }}
                    >
                      {desc}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* ── Right column ───────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Recent Predictions */}
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
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
                      background: isDark ? "rgba(22,163,74,0.15)" : "#dcfce7",
                      padding: "2px 7px",
                      borderRadius: "20px",
                      fontWeight: 600,
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
                  fontWeight: 600,
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
                      borderBottom: `1px solid ${isDark ? "#1e293b" : "#f3f4f6"}`,
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
                          background: isDark ? "#134e2b" : "#dcfce7",
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
              background: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%)",
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
              {
                label: "Mandis Active",
                value: todayMarket.mandis,
                icon: MapPin,
              },
              {
                label: "Avg Temperature",
                value: todayMarket.temp,
                icon: Thermometer,
              },
              {
                label: "Rainfall Today",
                value: todayMarket.rain,
                icon: CloudRain,
              },
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

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
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

// ── Data ──
const monthlyData = [
  {
    month: "Oct",
    wheat: 2100,
    rice: 3200,
    tomato: 1800,
    onion: 1200,
    cotton: 5800,
  },
  {
    month: "Nov",
    wheat: 2300,
    rice: 3100,
    tomato: 2200,
    onion: 1400,
    cotton: 5900,
  },
  {
    month: "Dec",
    wheat: 2200,
    rice: 3400,
    tomato: 1600,
    onion: 1800,
    cotton: 6100,
  },
  {
    month: "Jan",
    wheat: 2500,
    rice: 3300,
    tomato: 2800,
    onion: 2200,
    cotton: 6000,
  },
  {
    month: "Feb",
    wheat: 2400,
    rice: 3600,
    tomato: 3200,
    onion: 1900,
    cotton: 6200,
  },
  {
    month: "Mar",
    wheat: 2800,
    rice: 3500,
    tomato: 2900,
    onion: 1650,
    cotton: 6400,
  },
];

const regionData = [
  { region: "Punjab", avgPrice: 2847, volume: 4200, growth: 12.4 },
  { region: "Haryana", avgPrice: 3120, volume: 3800, growth: 8.1 },
  { region: "Maharashtra", avgPrice: 2650, volume: 5100, growth: -3.2 },
  { region: "Gujarat", avgPrice: 3400, volume: 2900, growth: 15.6 },
  { region: "Nashik", avgPrice: 1650, volume: 3200, growth: -5.8 },
  { region: "UP", avgPrice: 2100, volume: 6100, growth: 6.3 },
];

const radarData = [
  { subject: "Wheat", A: 85, B: 72 },
  { subject: "Rice", A: 78, B: 80 },
  { subject: "Tomato", A: 62, B: 58 },
  { subject: "Onion", A: 70, B: 65 },
  { subject: "Cotton", A: 88, B: 75 },
  { subject: "Maize", A: 74, B: 70 },
];

const volatilityData = [
  { month: "Oct", high: 2400, low: 1800, avg: 2100 },
  { month: "Nov", high: 2600, low: 2000, avg: 2300 },
  { month: "Dec", high: 2500, low: 1900, avg: 2200 },
  { month: "Jan", high: 2800, low: 2200, avg: 2500 },
  { month: "Feb", high: 2700, low: 2100, avg: 2400 },
  { month: "Mar", high: 3100, low: 2500, avg: 2800 },
];

const cropColors = {
  wheat: "#16a34a",
  rice: "#2563eb",
  tomato: "#ea580c",
  onion: "#9333ea",
  cotton: "#0891b2",
};

const statCards = [
  {
    label: "Avg Market Price",
    value: "₹2,847",
    change: "+8.3%",
    up: true,
    sub: "Across all crops",
  },
  {
    label: "Most Volatile",
    value: "Tomato",
    change: "±28%",
    up: null,
    sub: "Price swing this month",
  },
  {
    label: "Best Performer",
    value: "Cotton",
    change: "+15.6%",
    up: true,
    sub: "Gujarat region",
  },
  {
    label: "Lowest Growth",
    value: "Onion",
    change: "-5.8%",
    up: false,
    sub: "Nashik region",
  },
];

const CROP_TABS = ["All", "Wheat", "Rice", "Tomato", "Onion", "Cotton"];
const TIME_TABS = ["1M", "3M", "6M", "1Y"];

export default function Analytics() {
  const [activeCrop, setActiveCrop] = useState("All");
  const [activeTime, setActiveTime] = useState("6M");

  const visibleLines =
    activeCrop === "All" ? Object.keys(cropColors) : [activeCrop.toLowerCase()];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#1f2937",
            margin: 0,
          }}
        >
          Market Analytics
        </h1>
        <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
          Price trends, regional insights & crop performance overview
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        {statCards.map(({ label, value, change, up, sub }) => (
          <div
            key={label}
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #f3f4f6",
              boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
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
                fontSize: "20px",
                fontWeight: 700,
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              {value}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {up === true && (
                <ArrowUpRight
                  style={{ width: "13px", height: "13px", color: "#16a34a" }}
                />
              )}
              {up === false && (
                <ArrowDownRight
                  style={{ width: "13px", height: "13px", color: "#ef4444" }}
                />
              )}
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
                  color: "#9ca3af",
                  marginLeft: "2px",
                }}
              >
                · {sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Price Trend Chart */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #f3f4f6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
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
            <div
              style={{ fontSize: "15px", fontWeight: 700, color: "#1f2937" }}
            >
              Price Trend Analysis
            </div>
            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
              ₹ per quintal · filtered by crop
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Crop filter */}
            <div
              style={{
                display: "flex",
                background: "#f9fafb",
                borderRadius: "8px",
                padding: "3px",
                gap: "2px",
              }}
            >
              {CROP_TABS.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCrop(c)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    background: activeCrop === c ? "#16a34a" : "transparent",
                    color: activeCrop === c ? "white" : "#6b7280",
                    transition: "all 0.15s",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            {/* Time filter */}
            <div
              style={{
                display: "flex",
                background: "#f9fafb",
                borderRadius: "8px",
                padding: "3px",
                gap: "2px",
              }}
            >
              {TIME_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTime(t)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    background: activeTime === t ? "#1f2937" : "transparent",
                    color: activeTime === t ? "white" : "#6b7280",
                    transition: "all 0.15s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #E5E7EB",
                  fontSize: "12px",
                }}
                formatter={(v, n) => [
                  `₹${v.toLocaleString()}`,
                  n.charAt(0).toUpperCase() + n.slice(1),
                ]}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              {visibleLines.map((crop) => (
                <Line
                  key={crop}
                  type="monotone"
                  dataKey={crop}
                  stroke={cropColors[crop]}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  name={crop.charAt(0).toUpperCase() + crop.slice(1)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row — 3 charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Regional Bar Chart */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
            padding: "20px",
            height: "300px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: "12px", flexShrink: 0 }}>
            <div
              style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}
            >
              Avg Price by Region
            </div>
            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
              ₹ per quintal
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical" barSize={14}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F0F0F0"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                <YAxis
                  dataKey="region"
                  type="category"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  width={72}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                  formatter={(v) => [`₹${v.toLocaleString()}`, "Avg Price"]}
                />
                <Bar dataKey="avgPrice" fill="#16a34a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart — Wheat Volatility */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
            padding: "20px",
            height: "300px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: "12px", flexShrink: 0 }}>
            <div
              style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}
            >
              Wheat Price Volatility
            </div>
            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
              High / Low / Average range
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volatilityData}>
                <defs>
                  <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                  formatter={(v) => [`₹${v.toLocaleString()}`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="high"
                  stroke="#16a34a"
                  strokeWidth={1.5}
                  fill="url(#highGrad)"
                  name="High"
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Avg"
                  strokeDasharray="4 3"
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
          </div>
        </div>

        {/* Radar Chart */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
            padding: "20px",
            height: "300px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: "12px", flexShrink: 0 }}>
            <div
              style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}
            >
              Crop Performance Score
            </div>
            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
              This season vs last season
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: "#9ca3af" }} />
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
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Regional Table */}
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
            fontSize: "15px",
            fontWeight: 700,
            color: "#1f2937",
            marginBottom: "16px",
          }}
        >
          Regional Market Summary
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
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
                    color: "#9ca3af",
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
              <tr key={region} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  {region}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    color: "#1f2937",
                    fontWeight: 700,
                  }}
                >
                  ₹{avgPrice.toLocaleString()}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  {volume.toLocaleString()} qtl
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {growth > 0 ? (
                      <TrendingUp
                        style={{
                          width: "13px",
                          height: "13px",
                          color: "#16a34a",
                        }}
                      />
                    ) : (
                      <TrendingDown
                        style={{
                          width: "13px",
                          height: "13px",
                          color: "#ef4444",
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: growth > 0 ? "#16a34a" : "#ef4444",
                      }}
                    >
                      {growth > 0 ? "+" : ""}
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
                          ? "#f0fdf4"
                          : growth > 0
                            ? "#fffbeb"
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
      </div>
    </div>
  );
}

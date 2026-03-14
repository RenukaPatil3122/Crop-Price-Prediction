import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Clock,
  CheckCircle,
  RefreshCw,
  Database,
} from "lucide-react";
import { getPredictionHistory, getPredictionStats } from "../api";

const STATIC_DATA = [
  {
    id: "s1",
    crop: "Wheat",
    state: "Punjab",
    season: "Rabi",
    month_name: "March",
    predicted_price: 2847,
    actual_price: 2910,
    confidence: 87,
    status: "Verified",
    created_at: "2026-03-08T10:00:00",
  },
  {
    id: "s2",
    crop: "Rice",
    state: "Haryana",
    season: "Kharif",
    month_name: "February",
    predicted_price: 3520,
    actual_price: 3480,
    confidence: 82,
    status: "Verified",
    created_at: "2026-03-07T10:00:00",
  },
  {
    id: "s3",
    crop: "Tomato",
    state: "Maharashtra",
    season: "Zaid",
    month_name: "February",
    predicted_price: 2900,
    actual_price: null,
    confidence: 74,
    status: "Pending",
    created_at: "2026-03-06T10:00:00",
  },
  {
    id: "s4",
    crop: "Onion",
    state: "Punjab",
    season: "Rabi",
    month_name: "January",
    predicted_price: 1650,
    actual_price: 1590,
    confidence: 79,
    status: "Verified",
    created_at: "2026-03-05T10:00:00",
  },
  {
    id: "s5",
    crop: "Cotton",
    state: "Gujarat",
    season: "Kharif",
    month_name: "January",
    predicted_price: 6200,
    actual_price: null,
    confidence: 91,
    status: "Pending",
    created_at: "2026-03-04T10:00:00",
  },
  {
    id: "s6",
    crop: "Maize",
    state: "Uttar Pradesh",
    season: "Kharif",
    month_name: "December",
    predicted_price: 1980,
    actual_price: 2050,
    confidence: 85,
    status: "Verified",
    created_at: "2026-03-03T10:00:00",
  },
  {
    id: "s7",
    crop: "Mustard",
    state: "Rajasthan",
    season: "Rabi",
    month_name: "November",
    predicted_price: 5400,
    actual_price: null,
    confidence: 83,
    status: "Pending",
    created_at: "2026-02-28T10:00:00",
  },
  {
    id: "s8",
    crop: "Wheat",
    state: "Madhya Pradesh",
    season: "Rabi",
    month_name: "October",
    predicted_price: 2650,
    actual_price: 2700,
    confidence: 90,
    status: "Verified",
    created_at: "2026-02-27T10:00:00",
  },
];

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
  Soyabean: "🫘",
  Potato: "🥔",
  Mustard: "🌻",
};
const CROPS = [
  "All Crops",
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
const STATUSES = ["All", "Verified", "Pending"];
const PER_PAGE = 8;

const accuracyColor = (c) =>
  c >= 85 ? "#34d399" : c >= 75 ? "#fbbf24" : "#f87171";

function calcChange(predicted, actual) {
  if (!actual) return null;
  const pct = (((predicted - actual) / actual) * 100).toFixed(1);
  return { change: `${pct > 0 ? "+" : ""}${pct}%`, up: pct >= 0 };
}

function deduplicateRecords(data) {
  const seen = new Map();
  const sorted = [...data].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
  for (const row of sorted) {
    const key = `${row.crop}|${row.state}|${row.month_name}|${row.year ?? new Date(row.created_at).getFullYear()}`;
    if (!seen.has(key)) seen.set(key, row);
  }
  return Array.from(seen.values());
}

function exportToCSV(data, filename = "agrisense_predictions.csv") {
  const headers = [
    "ID",
    "Crop",
    "State",
    "Season",
    "Month",
    "Predicted ₹",
    "Actual ₹",
    "Confidence (%)",
    "Status",
    "Date",
  ];
  const rows = data.map((r) => [
    r.id,
    r.crop,
    r.state,
    r.season,
    r.month_name,
    r.predicted_price,
    r.actual_price ?? "Pending",
    r.confidence,
    r.status,
    new Date(r.created_at).toLocaleDateString("en-IN"),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((c) => `"${c}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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

export default function History() {
  const { isDark } = useTheme();

  const [allData, setAllData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    avg_accuracy: 0,
  });
  const [dbLive, setDbLive] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("All Crops");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const text = isDark ? "#e8edf8" : "#0f172a";
  const muted = isDark ? "#94a3b8" : "#4b5563";
  const cardShadow = isDark
    ? "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
    : "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)";
  const inputBg = isDark ? "rgba(15,23,42,0.8)" : "#f8fafc";

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [histRes, statsRes] = await Promise.all([
        getPredictionHistory({ limit: 200 }),
        getPredictionStats(),
      ]);
      if (histRes.data?.length > 0) {
        const deduped = deduplicateRecords(histRes.data);
        setAllData(deduped);
        setStats({
          total: deduped.length,
          verified: deduped.filter((d) => d.status === "Verified").length,
          pending: deduped.filter((d) => d.status === "Pending").length,
          avg_accuracy: statsRes.avg_accuracy ?? 0,
        });
        setDbLive(true);
      } else {
        setAllData(STATIC_DATA);
        setStats({
          total: STATIC_DATA.length,
          verified: STATIC_DATA.filter((d) => d.status === "Verified").length,
          pending: STATIC_DATA.filter((d) => d.status === "Pending").length,
          avg_accuracy: 91.2,
        });
        setDbLive(false);
      }
    } catch {
      setAllData(STATIC_DATA);
      setStats({ total: 8, verified: 5, pending: 3, avg_accuracy: 91.2 });
      setDbLive(false);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = allData
    .filter((r) => cropFilter === "All Crops" || r.crop === cropFilter)
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .filter(
      (r) =>
        r.crop?.toLowerCase().includes(search.toLowerCase()) ||
        r.state?.toLowerCase().includes(search.toLowerCase()),
    );

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortBy] ?? "",
      bv = b[sortBy] ?? "";
    if (typeof av === "string") {
      av = av.toLowerCase();
      bv = bv.toLowerCase();
    }
    return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
    setPage(1);
  };
  const sortIcon = (col) =>
    sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕";

  const handleExport = () => {
    setExporting(true);
    const ts = new Date().toISOString().slice(0, 10);
    exportToCSV(
      sorted,
      `agrisense_${cropFilter === "All Crops" ? "all" : cropFilter.toLowerCase()}_${ts}.csv`,
    );
    setTimeout(() => setExporting(false), 1500);
  };

  const statCards = [
    {
      label: "Total Predictions",
      value: loadingData ? "…" : stats.total,
      sub: "All time",
      glowColor: "#60a5fa",
      icon: "📊",
    },
    {
      label: "Verified",
      value: loadingData ? "…" : stats.verified,
      sub: "Actual price confirmed",
      glowColor: "#34d399",
      icon: "✅",
    },
    {
      label: "Pending",
      value: loadingData ? "…" : stats.pending,
      sub: "Awaiting actual price",
      glowColor: "#fbbf24",
      icon: "⏳",
    },
    {
      label: "Avg Accuracy",
      value: loadingData ? "…" : `${stats.avg_accuracy}%`,
      sub: "On verified predictions",
      glowColor: "#34d399",
      icon: "🎯",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { 0%{opacity:0;transform:scale(0.92) translateY(10px)} 60%{transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .h-fade-1 { animation: fadeUp 0.45s 0.00s ease both; }
        .h-fade-2 { animation: fadeUp 0.45s 0.07s ease both; }
        .h-fade-3 { animation: fadeUp 0.45s 0.14s ease both; }
        .h-fade-4 { animation: fadeUp 0.45s 0.21s ease both; }

        .pulse-dot { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }

        .h-refresh-btn { transition: all 0.18s ease; }
        .h-refresh-btn:hover:not(:disabled) { background: ${isDark ? "rgba(52,211,153,0.1)" : "#f0fdf4"} !important; border-color: rgba(52,211,153,0.3) !important; color: #34d399 !important; }

        .h-export-btn { transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        .h-export-btn:not(:disabled):hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 32px rgba(22,163,74,0.4) !important; }

        .stat-card { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); cursor: default; }
        .stat-card:hover { transform: translateY(-3px); }

        .table-row { transition: background 0.12s; }
        .table-row:hover { background: ${isDark ? "rgba(52,211,153,0.04)" : "#f0fdf4"} !important; }

        .page-btn { transition: all 0.15s; }
        .page-btn:hover:not(:disabled) { border-color: rgba(52,211,153,0.3) !important; color: #34d399 !important; }

        .search-wrap { transition: border-color 0.2s, box-shadow 0.2s; }
        .search-wrap:focus-within { border-color: rgba(52,211,153,0.5) !important; box-shadow: 0 0 0 3px rgba(52,211,153,0.1) !important; }

        .filter-sel { transition: border-color 0.2s, box-shadow 0.2s; }
        .filter-sel:focus { border-color: rgba(52,211,153,0.5) !important; box-shadow: 0 0 0 3px rgba(52,211,153,0.1); outline: none; }

        ${isDark ? "select option { background: #1e293b; color: #f1f5f9; }" : ""}

        @media (max-width: 640px) {
          .h-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .h-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* HEADER */}
      <div
        className="h-fade-1 h-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "4px",
            }}
          >
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: text,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Prediction History
            </h1>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "20px",
                background: dbLive
                  ? isDark
                    ? "rgba(52,211,153,0.12)"
                    : "#dcfce7"
                  : isDark
                    ? "rgba(251,191,36,0.12)"
                    : "#fef3c7",
                color: dbLive ? "#34d399" : "#fbbf24",
                border: `1px solid ${dbLive ? "rgba(52,211,153,0.25)" : "rgba(251,191,36,0.25)"}`,
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
                  background: dbLive ? "#34d399" : "#fbbf24",
                  display: "inline-block",
                }}
              />
              <Database style={{ width: "10px", height: "10px" }} />
              {dbLive ? "Live from MongoDB" : "Sample data"}
            </span>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: muted,
              fontWeight: 400,
              margin: 0,
            }}
          >
            Track all past predictions and their accuracy
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <button
            className="h-refresh-btn"
            onClick={loadData}
            disabled={loadingData}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              borderRadius: "12px",
              border: `1px solid ${cardBorder}`,
              background: isDark ? "rgba(30,41,59,0.8)" : "white",
              color: text,
              fontSize: "13px",
              fontWeight: 700,
              cursor: loadingData ? "not-allowed" : "pointer",
              opacity: loadingData ? 0.6 : 1,
              boxShadow: cardShadow,
            }}
          >
            <RefreshCw
              style={{
                width: "14px",
                height: "14px",
                animation: loadingData ? "spin 1s linear infinite" : "none",
              }}
            />
            Refresh
          </button>
          <button
            className="h-export-btn"
            onClick={handleExport}
            disabled={exporting || sorted.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              borderRadius: "12px",
              background: exporting
                ? isDark
                  ? "rgba(52,211,153,0.12)"
                  : "#f0fdf4"
                : "linear-gradient(135deg,#166534 0%,#16A34A 100%)",
              color: exporting ? "#34d399" : "white",
              border: exporting ? "1px solid rgba(52,211,153,0.25)" : "none",
              fontWeight: 800,
              fontSize: "13px",
              cursor: sorted.length === 0 ? "not-allowed" : "pointer",
              opacity: sorted.length === 0 ? 0.5 : 1,
              boxShadow: exporting ? "none" : "0 4px 20px rgba(22,163,74,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {exporting ? (
              <>
                <CheckCircle style={{ width: "14px", height: "14px" }} />{" "}
                Exported!
              </>
            ) : (
              <>
                <Download style={{ width: "14px", height: "14px" }} /> Export
                CSV ({sorted.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div
        className="h-fade-2 h-stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        {statCards.map(({ label, value, sub, glowColor, icon }, i) => (
          <div
            key={label}
            className="stat-card"
            style={{
              position: "relative",
              overflow: "hidden",
              background: isDark
                ? "rgba(30,41,59,0.8)"
                : "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
              borderRadius: "20px",
              padding: "20px 22px",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
              boxShadow: cardShadow,
              animation: `popIn 0.55s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms both`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-25px",
                right: "-15px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: `radial-gradient(circle,${glowColor}22 0%,transparent 70%)`,
                pointerEvents: "none",
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
                opacity: 0.5,
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "10px",
                }}
              >
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
                <span style={{ fontSize: "18px" }}>{icon}</span>
              </div>
              <h3
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: isDark ? "#f0f4ff" : "#0f172a",
                  margin: "0 0 4px",
                  letterSpacing: "-0.03em",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {value}
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
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <Card
        isDark={isDark}
        cardBorder={cardBorder}
        cardShadow={cardShadow}
        className="h-fade-3"
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          className="search-wrap"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: inputBg,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: "12px",
            padding: "0 14px",
            flex: 1,
            minWidth: "180px",
          }}
        >
          <Search
            style={{
              width: "14px",
              height: "14px",
              color: muted,
              flexShrink: 0,
            }}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search crop or state..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "13px",
              color: text,
              padding: "10px 0",
              width: "100%",
            }}
          />
        </div>

        <select
          className="filter-sel"
          value={cropFilter}
          onChange={(e) => {
            setCropFilter(e.target.value);
            setPage(1);
          }}
          style={{
            height: "42px",
            borderRadius: "12px",
            padding: "0 30px 0 12px",
            fontSize: "13px",
            fontWeight: 500,
            color: isDark ? "#f1f5f9" : "#111827",
            background: inputBg,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            outline: "none",
            cursor: "pointer",
            appearance: "none",
            WebkitAppearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
        >
          {CROPS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div
          style={{
            display: "flex",
            background: isDark ? "rgba(0,0,0,0.3)" : "#f1f5f9",
            borderRadius: "12px",
            padding: "3px",
            gap: "2px",
            border: `1px solid ${cardBorder}`,
          }}
        >
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              style={{
                padding: "6px 14px",
                borderRadius: "9px",
                fontSize: "12px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
                background: statusFilter === s ? "#34d399" : "transparent",
                color: statusFilter === s ? "#071a0e" : muted,
                boxShadow:
                  statusFilter === s ? "0 0 10px rgba(52,211,153,0.3)" : "none",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            color: muted,
            fontWeight: 600,
            background: isDark ? "rgba(52,211,153,0.06)" : "#f0fdf4",
            padding: "5px 12px",
            borderRadius: "20px",
            border: "1px solid rgba(52,211,153,0.15)",
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </Card>

      {/* TABLE */}
      <Card
        isDark={isDark}
        cardBorder={cardBorder}
        cardShadow={cardShadow}
        className="h-fade-4"
        style={{ overflow: "hidden" }}
      >
        {loadingData ? (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: muted,
              fontSize: "14px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: `3px solid ${isDark ? "rgba(52,211,153,0.1)" : "#dcfce7"}`,
                borderTopColor: "#34d399",
                animation: "spin 1s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            Loading predictions…
          </div>
        ) : (
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
                minWidth: "760px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                  }}
                >
                  {[
                    { label: "Crop", key: "crop" },
                    { label: "State", key: "state" },
                    { label: "Season", key: "season" },
                    { label: "Month", key: "month_name" },
                    { label: "Predicted ₹", key: "predicted_price" },
                    { label: "Actual ₹", key: "actual_price" },
                    { label: "Change", key: null },
                    { label: "Confidence", key: "confidence" },
                    { label: "Status", key: "status" },
                    { label: "Date", key: "created_at" },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      onClick={() => key && toggleSort(key)}
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        fontSize: "11px",
                        color: muted,
                        fontWeight: 700,
                        cursor: key ? "pointer" : "default",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {label}
                      {key ? sortIcon(key) : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row) => {
                  const chg = calcChange(
                    row.predicted_price,
                    row.actual_price,
                  ) ||
                    CROP_CHANGES[row.crop] || { change: "—", up: true };
                  return (
                    <tr
                      key={row.id}
                      className="table-row"
                      style={{
                        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}`,
                      }}
                    >
                      <td style={{ padding: "11px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "10px",
                              background: isDark
                                ? "rgba(52,211,153,0.08)"
                                : "#f0fdf4",
                              border: `1px solid ${isDark ? "rgba(52,211,153,0.15)" : "rgba(22,163,74,0.15)"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "15px",
                            }}
                          >
                            {CROP_EMOJI[row.crop] || "🌱"}
                          </div>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: text,
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {row.crop}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: "13px",
                          color: text,
                          fontWeight: 500,
                        }}
                      >
                        {row.state}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: muted,
                            background: isDark
                              ? "rgba(255,255,255,0.06)"
                              : "#f1f5f9",
                            padding: "3px 9px",
                            borderRadius: "8px",
                            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                          }}
                        >
                          {row.season}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: "13px",
                          color: text,
                          fontWeight: 500,
                        }}
                      >
                        {row.month_name}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: "13px",
                          fontWeight: 800,
                          color: text,
                          fontFamily: "'DM Mono',monospace",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        ₹{Number(row.predicted_price).toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: row.actual_price ? text : muted,
                          fontFamily: "'DM Mono',monospace",
                        }}
                      >
                        {row.actual_price
                          ? `₹${Number(row.actual_price).toLocaleString()}`
                          : "—"}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        {chg.change !== "—" ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              background: chg.up
                                ? "rgba(52,211,153,0.08)"
                                : "rgba(248,113,113,0.08)",
                              padding: "3px 8px",
                              borderRadius: "8px",
                              width: "fit-content",
                            }}
                          >
                            {chg.up ? (
                              <TrendingUp
                                style={{
                                  width: "11px",
                                  height: "11px",
                                  color: "#34d399",
                                }}
                              />
                            ) : (
                              <TrendingDown
                                style={{
                                  width: "11px",
                                  height: "11px",
                                  color: "#f87171",
                                }}
                              />
                            )}
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: chg.up ? "#34d399" : "#f87171",
                                fontFamily: "'DM Mono',monospace",
                              }}
                            >
                              {chg.change}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: muted }}>
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: "5px",
                              background: isDark
                                ? "rgba(255,255,255,0.06)"
                                : "#e5e7eb",
                              borderRadius: "3px",
                              minWidth: "48px",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${row.confidence}%`,
                                background: accuracyColor(row.confidence),
                                borderRadius: "3px",
                                boxShadow: `0 0 6px ${accuracyColor(row.confidence)}50`,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 800,
                              color: accuracyColor(row.confidence),
                              fontFamily: "'DM Mono',monospace",
                            }}
                          >
                            {row.confidence}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: "20px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background:
                              row.status === "Verified"
                                ? isDark
                                  ? "rgba(52,211,153,0.12)"
                                  : "#dcfce7"
                                : isDark
                                  ? "rgba(251,191,36,0.12)"
                                  : "#fef3c7",
                            color:
                              row.status === "Verified" ? "#34d399" : "#fbbf24",
                            border: `1px solid ${row.status === "Verified" ? "rgba(52,211,153,0.25)" : "rgba(251,191,36,0.25)"}`,
                          }}
                        >
                          {row.status === "Verified" ? (
                            <CheckCircle
                              style={{ width: "10px", height: "10px" }}
                            />
                          ) : (
                            <Clock style={{ width: "10px", height: "10px" }} />
                          )}
                          {row.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: "12px",
                          color: muted,
                          fontWeight: 500,
                        }}
                      >
                        {new Date(row.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loadingData && paginated.length === 0 && (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: muted,
              fontSize: "14px",
            }}
          >
            No predictions found.
          </div>
        )}

        {/* Pagination */}
        {!loadingData && sorted.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              flexWrap: "wrap",
              gap: "8px",
              position: "relative",
            }}
          >
            <span style={{ fontSize: "12px", color: muted, fontWeight: 500 }}>
              Showing {Math.min((page - 1) * PER_PAGE + 1, sorted.length)}–
              {Math.min(page * PER_PAGE, sorted.length)} of {sorted.length}
            </span>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "5px 12px",
                  borderRadius: "9px",
                  border: `1px solid ${cardBorder}`,
                  background: isDark ? "rgba(30,41,59,0.8)" : "white",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  color: page === 1 ? muted : text,
                }}
              >
                ← Prev
              </button>
              {Array.from(
                { length: Math.min(totalPages, 7) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  className="page-btn"
                  onClick={() => setPage(p)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: "9px",
                    border: `1px solid ${p === page ? "rgba(52,211,153,0.4)" : cardBorder}`,
                    fontSize: "12px",
                    fontWeight: p === page ? 800 : 500,
                    cursor: "pointer",
                    background:
                      p === page
                        ? "#34d399"
                        : isDark
                          ? "rgba(30,41,59,0.8)"
                          : "white",
                    color: p === page ? "#071a0e" : text,
                    boxShadow:
                      p === page ? "0 0 10px rgba(52,211,153,0.3)" : "none",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "5px 12px",
                  borderRadius: "9px",
                  border: `1px solid ${cardBorder}`,
                  background: isDark ? "rgba(30,41,59,0.8)" : "white",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  color: page === totalPages ? muted : text,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

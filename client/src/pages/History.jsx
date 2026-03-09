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

// ── Static fallback data (shown when MongoDB is empty / unavailable) ──────────
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

const accuracyColor = (c) =>
  c >= 85 ? "#16a34a" : c >= 75 ? "#f59e0b" : "#ef4444";

function calcChange(predicted, actual) {
  if (!actual) return null;
  const pct = (((predicted - actual) / actual) * 100).toFixed(1);
  return { change: `${pct > 0 ? "+" : ""}${pct}%`, up: pct >= 0 };
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

const PER_PAGE = 8;

export default function History() {
  const { isDark } = useTheme();

  // Data state
  const [allData, setAllData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    avg_accuracy: 0,
  });
  const [dbLive, setDbLive] = useState(false); // is MongoDB active?
  const [loadingData, setLoadingData] = useState(true);

  // Filter state
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("All Crops");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const card = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#f3f4f6";
  const text = isDark ? "#f1f5f9" : "#1f2937";
  const muted = isDark ? "#94a3b8" : "#9ca3af";
  const rowHover = isDark ? "#243044" : "#fafafa";

  // ── Load data from MongoDB (with fallback) ────────────────────────────────
  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [histRes, statsRes] = await Promise.all([
        getPredictionHistory({ limit: 200 }),
        getPredictionStats(),
      ]);

      if (histRes.data && histRes.data.length > 0) {
        setAllData(histRes.data);
        setStats(statsRes);
        setDbLive(true);
      } else {
        // DB empty — use static fallback
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
      // DB unavailable — use static fallback
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

  // ── Filter + Sort ─────────────────────────────────────────────────────────
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
    const clabel =
      cropFilter === "All Crops" ? "all" : cropFilter.toLowerCase();
    const slabel = statusFilter === "All" ? "all" : statusFilter.toLowerCase();
    exportToCSV(sorted, `agrisense_${clabel}_${slabel}_${ts}.csv`);
    setTimeout(() => setExporting(false), 1500);
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: text,
                margin: 0,
              }}
            >
              Prediction History
            </h1>
            {/* DB status badge */}
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: "20px",
                background: dbLive ? "#dcfce7" : "rgba(245,158,11,0.15)",
                color: dbLive ? "#16a34a" : "#d97706",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Database style={{ width: "11px", height: "11px" }} />
              {dbLive ? "Live from MongoDB" : "Using sample data"}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: muted, marginTop: "4px" }}>
            Track all past predictions and their accuracy
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loadingData}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 14px",
              borderRadius: "10px",
              background: isDark ? "#334155" : "#f3f4f6",
              color: text,
              fontWeight: 600,
              fontSize: "13px",
              border: `1px solid ${border}`,
              cursor: "pointer",
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
          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting || sorted.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "10px",
              background: exporting
                ? "#f0fdf4"
                : "linear-gradient(135deg,#166534,#16a34a)",
              color: exporting ? "#16a34a" : "white",
              fontWeight: 600,
              fontSize: "13px",
              border: exporting ? "1px solid #bbf7d0" : "none",
              cursor: sorted.length === 0 ? "not-allowed" : "pointer",
              boxShadow: exporting ? "none" : "0 2px 8px rgba(22,163,74,0.3)",
              transition: "all 0.2s",
              opacity: sorted.length === 0 ? 0.5 : 1,
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

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        {[
          {
            label: "Total Predictions",
            value: loadingData ? "…" : stats.total,
            sub: "All time",
            color: "#2563eb",
            bg: isDark ? "#1e3a5f" : "#eff6ff",
            cb: isDark ? "#1e4080" : "#bfdbfe",
          },
          {
            label: "Verified",
            value: loadingData ? "…" : stats.verified,
            sub: "Actual price confirmed",
            color: "#16a34a",
            bg: isDark ? "#134e2b" : "#f0fdf4",
            cb: isDark ? "#1a6535" : "#bbf7d0",
          },
          {
            label: "Pending",
            value: loadingData ? "…" : stats.pending,
            sub: "Awaiting actual price",
            color: "#f59e0b",
            bg: isDark ? "#3d2a00" : "#fffbeb",
            cb: isDark ? "#7a5200" : "#fde68a",
          },
          {
            label: "Avg Accuracy",
            value: loadingData ? "…" : `${stats.avg_accuracy}%`,
            sub: "On verified predictions",
            color: "#16a34a",
            bg: isDark ? "#134e2b" : "#f0fdf4",
            cb: isDark ? "#1a6535" : "#bbf7d0",
          },
        ].map(({ label, value, sub, color, bg, cb }) => (
          <div
            key={label}
            style={{
              background: bg,
              border: `1px solid ${cb}`,
              borderRadius: "14px",
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
                fontSize: "24px",
                fontWeight: 700,
                color,
                marginBottom: "4px",
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: "11px", color: muted }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: card,
          borderRadius: "14px",
          border: `1px solid ${border}`,
          padding: "14px 18px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: isDark ? "#0f172a" : "#f9fafb",
            border: `1px solid ${border}`,
            borderRadius: "10px",
            padding: "0 12px",
            flex: 1,
            minWidth: "180px",
          }}
        >
          <Search style={{ width: "14px", height: "14px", color: muted }} />
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
              padding: "8px 0",
              width: "100%",
            }}
          />
        </div>
        <select
          value={cropFilter}
          onChange={(e) => {
            setCropFilter(e.target.value);
            setPage(1);
          }}
          style={{
            height: "36px",
            borderRadius: "10px",
            padding: "0 10px",
            fontSize: "13px",
            color: text,
            background: isDark ? "#0f172a" : "#f9fafb",
            border: `1px solid ${border}`,
            outline: "none",
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
            background: isDark ? "#0f172a" : "#f9fafb",
            border: `1px solid ${border}`,
            borderRadius: "9px",
            padding: "3px",
            gap: "2px",
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
                padding: "5px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: statusFilter === s ? "#16a34a" : "transparent",
                color: statusFilter === s ? "white" : muted,
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", fontSize: "12px", color: muted }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: card,
          borderRadius: "16px",
          border: `1px solid ${border}`,
          overflow: "hidden",
        }}
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
            <RefreshCw
              style={{
                width: "24px",
                height: "24px",
                margin: "0 auto 12px",
                display: "block",
                opacity: 0.5,
              }}
            />
            Loading predictions…
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: isDark ? "#0f172a" : "#f9fafb",
                  borderBottom: `1px solid ${border}`,
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
                      fontWeight: 600,
                      cursor: key ? "pointer" : "default",
                      userSelect: "none",
                      whiteSpace: "nowrap",
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
                const chg = calcChange(row.predicted_price, row.actual_price) ||
                  CROP_CHANGES[row.crop] || { change: "—", up: true };
                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: `1px solid ${border}`,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = rowHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "11px 16px" }}>
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
                          {CROP_EMOJI[row.crop] || "🌱"}
                        </div>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: text,
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
                        color: muted,
                      }}
                    >
                      {row.state}
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          color: muted,
                          background: isDark ? "#0f172a" : "#f3f4f6",
                          padding: "2px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {row.season}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: "13px",
                        color: muted,
                      }}
                    >
                      {row.month_name}
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: text,
                      }}
                    >
                      ₹{Number(row.predicted_price).toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: row.actual_price
                          ? text
                          : isDark
                            ? "#475569"
                            : "#d1d5db",
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
                            gap: "3px",
                          }}
                        >
                          {chg.up ? (
                            <TrendingUp
                              style={{
                                width: "12px",
                                height: "12px",
                                color: "#16a34a",
                              }}
                            />
                          ) : (
                            <TrendingDown
                              style={{
                                width: "12px",
                                height: "12px",
                                color: "#ef4444",
                              }}
                            />
                          )}
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: chg.up ? "#16a34a" : "#ef4444",
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
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: "4px",
                            background: isDark ? "#334155" : "#f3f4f6",
                            borderRadius: "2px",
                            minWidth: "48px",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${row.confidence}%`,
                              background: accuracyColor(row.confidence),
                              borderRadius: "2px",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: accuracyColor(row.confidence),
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
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background:
                            row.status === "Verified"
                              ? isDark
                                ? "rgba(22,163,74,0.15)"
                                : "#f0fdf4"
                              : isDark
                                ? "rgba(245,158,11,0.15)"
                                : "#fffbeb",
                          color:
                            row.status === "Verified" ? "#16a34a" : "#d97706",
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
              borderTop: `1px solid ${border}`,
            }}
          >
            <span style={{ fontSize: "12px", color: muted }}>
              Showing {Math.min((page - 1) * PER_PAGE + 1, sorted.length)}–
              {Math.min(page * PER_PAGE, sorted.length)} of {sorted.length}
            </span>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "5px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${border}`,
                  background: card,
                  fontSize: "12px",
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
                  onClick={() => setPage(p)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "8px",
                    border: `1px solid ${border}`,
                    fontSize: "12px",
                    cursor: "pointer",
                    background: page === p ? "#16a34a" : card,
                    color: page === p ? "white" : text,
                    fontWeight: page === p ? 700 : 400,
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "5px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${border}`,
                  background: card,
                  fontSize: "12px",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  color: page === totalPages ? muted : text,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

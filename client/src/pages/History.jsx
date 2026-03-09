import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Clock,
  CheckCircle,
} from "lucide-react";

const allHistory = [
  {
    id: 1,
    crop: "Wheat",
    region: "Punjab",
    season: "Rabi",
    month: "March",
    predictedPrice: 2847,
    actualPrice: 2910,
    confidence: 87,
    change: "+12.4%",
    up: true,
    date: "2026-03-08",
    status: "Verified",
  },
  {
    id: 2,
    crop: "Rice",
    region: "Haryana",
    season: "Kharif",
    month: "February",
    predictedPrice: 3520,
    actualPrice: 3480,
    confidence: 82,
    change: "+5.1%",
    up: true,
    date: "2026-03-07",
    status: "Verified",
  },
  {
    id: 3,
    crop: "Tomato",
    region: "Maharashtra",
    season: "Zaid",
    month: "February",
    predictedPrice: 2900,
    actualPrice: null,
    confidence: 74,
    change: "-3.2%",
    up: false,
    date: "2026-03-06",
    status: "Pending",
  },
  {
    id: 4,
    crop: "Onion",
    region: "Nashik",
    season: "Rabi",
    month: "January",
    predictedPrice: 1650,
    actualPrice: 1590,
    confidence: 79,
    change: "+18.3%",
    up: true,
    date: "2026-03-05",
    status: "Verified",
  },
  {
    id: 5,
    crop: "Cotton",
    region: "Gujarat",
    season: "Kharif",
    month: "January",
    predictedPrice: 6200,
    actualPrice: null,
    confidence: 91,
    change: "-7.1%",
    up: false,
    date: "2026-03-04",
    status: "Pending",
  },
  {
    id: 6,
    crop: "Maize",
    region: "UP",
    season: "Kharif",
    month: "December",
    predictedPrice: 1980,
    actualPrice: 2050,
    confidence: 85,
    change: "+9.2%",
    up: true,
    date: "2026-03-03",
    status: "Verified",
  },
  {
    id: 7,
    crop: "Soybean",
    region: "MP",
    season: "Kharif",
    month: "December",
    predictedPrice: 4320,
    actualPrice: 4280,
    confidence: 88,
    change: "+4.5%",
    up: true,
    date: "2026-03-02",
    status: "Verified",
  },
  {
    id: 8,
    crop: "Potato",
    region: "UP",
    season: "Rabi",
    month: "November",
    predictedPrice: 1120,
    actualPrice: 1200,
    confidence: 76,
    change: "-2.8%",
    up: false,
    date: "2026-03-01",
    status: "Verified",
  },
  {
    id: 9,
    crop: "Mustard",
    region: "Rajasthan",
    season: "Rabi",
    month: "November",
    predictedPrice: 5400,
    actualPrice: null,
    confidence: 83,
    change: "+6.7%",
    up: true,
    date: "2026-02-28",
    status: "Pending",
  },
  {
    id: 10,
    crop: "Wheat",
    region: "MP",
    season: "Rabi",
    month: "October",
    predictedPrice: 2650,
    actualPrice: 2700,
    confidence: 90,
    change: "+8.1%",
    up: true,
    date: "2026-02-27",
    status: "Verified",
  },
  {
    id: 11,
    crop: "Rice",
    region: "Punjab",
    season: "Kharif",
    month: "October",
    predictedPrice: 3100,
    actualPrice: 3050,
    confidence: 86,
    change: "+3.3%",
    up: true,
    date: "2026-02-26",
    status: "Verified",
  },
  {
    id: 12,
    crop: "Tomato",
    region: "Karnataka",
    season: "Zaid",
    month: "October",
    predictedPrice: 2200,
    actualPrice: 2400,
    confidence: 71,
    change: "+22.1%",
    up: true,
    date: "2026-02-25",
    status: "Verified",
  },
];

const CROPS = [
  "All Crops",
  "Wheat",
  "Rice",
  "Tomato",
  "Onion",
  "Cotton",
  "Maize",
  "Soybean",
  "Potato",
  "Mustard",
];
const STATUSES = ["All", "Verified", "Pending"];

const accuracyColor = (c) =>
  c >= 85 ? "#16a34a" : c >= 75 ? "#f59e0b" : "#ef4444";

// ── CSV Export ────────────────────────────────────────────────────────────────
function exportToCSV(data, filename = "agrisense_predictions.csv") {
  const headers = [
    "ID",
    "Crop",
    "Region",
    "Season",
    "Month",
    "Predicted Price (₹)",
    "Actual Price (₹)",
    "Change",
    "Confidence (%)",
    "Status",
    "Date",
  ];

  const rows = data.map((r) => [
    r.id,
    r.crop,
    r.region,
    r.season,
    r.month,
    r.predictedPrice,
    r.actualPrice ?? "Pending",
    r.change,
    r.confidence,
    r.status,
    r.date,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function History() {
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("All Crops");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const PER_PAGE = 8;

  const filtered = allHistory
    .filter((r) => cropFilter === "All Crops" || r.crop === cropFilter)
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .filter(
      (r) =>
        r.crop.toLowerCase().includes(search.toLowerCase()) ||
        r.region.toLowerCase().includes(search.toLowerCase()),
    );

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortBy],
      bv = b[sortBy];
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
  };
  const sortIcon = (col) =>
    sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕";

  // Summary stats
  const verified = allHistory.filter((r) => r.status === "Verified");
  const withActual = verified.filter((r) => r.actualPrice);
  const avgAccuracy = Math.round(
    withActual.reduce(
      (s, r) =>
        s +
        (100 -
          (Math.abs(r.predictedPrice - r.actualPrice) / r.actualPrice) * 100),
      0,
    ) / (withActual.length || 1),
  );

  // ── Export handler ──────────────────────────────────────────────────────────
  const handleExport = () => {
    setExporting(true);

    // Export the currently filtered + sorted data (not just current page)
    const dataToExport = sorted;
    const timestamp = new Date().toISOString().slice(0, 10);
    const statusLabel =
      statusFilter === "All" ? "all" : statusFilter.toLowerCase();
    const cropLabel =
      cropFilter === "All Crops" ? "all_crops" : cropFilter.toLowerCase();
    const filename = `agrisense_${cropLabel}_${statusLabel}_${timestamp}.csv`;

    exportToCSV(dataToExport, filename);

    // Brief visual feedback
    setTimeout(() => setExporting(false), 1500);
  };

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
              color: "#1f2937",
              margin: 0,
            }}
          >
            Prediction History
          </h1>
          <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
            Track all past predictions and their accuracy
          </p>
        </div>

        {/* ✅ Export CSV Button */}
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
              : "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
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
              <Download style={{ width: "14px", height: "14px" }} /> Export CSV
              ({sorted.length})
            </>
          )}
        </button>
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
            value: allHistory.length,
            sub: "All time",
            color: "#2563eb",
            bg: "#eff6ff",
            border: "#bfdbfe",
          },
          {
            label: "Verified",
            value: verified.length,
            sub: "Actual price available",
            color: "#16a34a",
            bg: "#f0fdf4",
            border: "#bbf7d0",
          },
          {
            label: "Pending",
            value: allHistory.length - verified.length,
            sub: "Awaiting actual price",
            color: "#f59e0b",
            bg: "#fffbeb",
            border: "#fde68a",
          },
          {
            label: "Avg Accuracy",
            value: `${avgAccuracy}%`,
            sub: "On verified predictions",
            color: "#16a34a",
            bg: "#f0fdf4",
            border: "#bbf7d0",
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
                fontSize: "24px",
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

      {/* Filters */}
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          border: "1px solid #f3f4f6",
          padding: "16px 20px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f9fafb",
            borderRadius: "10px",
            padding: "0 12px",
            flex: 1,
            minWidth: "180px",
          }}
        >
          <Search style={{ width: "14px", height: "14px", color: "#9ca3af" }} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search crop or region..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "13px",
              color: "#374151",
              padding: "8px 0",
              width: "100%",
            }}
          />
        </div>

        {/* Crop filter */}
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
            color: "#374151",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            outline: "none",
          }}
        >
          {CROPS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <div
          style={{
            display: "flex",
            background: "#f9fafb",
            borderRadius: "8px",
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
                color: statusFilter === s ? "white" : "#6b7280",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", fontSize: "12px", color: "#9ca3af" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #f3f4f6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f9fafb",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              {[
                { label: "Crop", key: "crop" },
                { label: "Region", key: "region" },
                { label: "Season", key: "season" },
                { label: "Month", key: "month" },
                { label: "Predicted ₹", key: "predictedPrice" },
                { label: "Actual ₹", key: "actualPrice" },
                { label: "Change", key: "change" },
                { label: "Confidence", key: "confidence" },
                { label: "Status", key: "status" },
                { label: "Date", key: "date" },
              ].map(({ label, key }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontSize: "12px",
                    color: "#6b7280",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                  {sortIcon(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => (
              <tr
                key={row.id}
                style={{ borderBottom: "1px solid #f9fafb" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fafafa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                <td style={{ padding: "12px 16px" }}>
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
                        background: "#f0fdf4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                      }}
                    >
                      {row.crop === "Wheat"
                        ? "🌾"
                        : row.crop === "Rice"
                          ? "🍚"
                          : row.crop === "Tomato"
                            ? "🍅"
                            : row.crop === "Onion"
                              ? "🧅"
                              : row.crop === "Cotton"
                                ? "🌿"
                                : row.crop === "Maize"
                                  ? "🌽"
                                  : row.crop === "Soybean"
                                    ? "🫘"
                                    : row.crop === "Potato"
                                      ? "🥔"
                                      : row.crop === "Mustard"
                                        ? "🌻"
                                        : "🌱"}
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      {row.crop}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  {row.region}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      background: "#f3f4f6",
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    {row.season}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  {row.month}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  ₹{row.predictedPrice.toLocaleString()}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: row.actualPrice ? "#1f2937" : "#d1d5db",
                  }}
                >
                  {row.actualPrice
                    ? `₹${row.actualPrice.toLocaleString()}`
                    : "—"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    {row.up ? (
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
                        color: row.up ? "#16a34a" : "#ef4444",
                      }}
                    >
                      {row.change}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
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
                        background: "#f3f4f6",
                        borderRadius: "2px",
                        minWidth: "50px",
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
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: "20px",
                      background:
                        row.status === "Verified" ? "#f0fdf4" : "#fffbeb",
                      color: row.status === "Verified" ? "#16a34a" : "#d97706",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {row.status === "Verified" ? (
                      <CheckCircle style={{ width: "10px", height: "10px" }} />
                    ) : (
                      <Clock style={{ width: "10px", height: "10px" }} />
                    )}
                    {row.status}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: "12px",
                    color: "#9ca3af",
                  }}
                >
                  {new Date(row.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "14px",
            }}
          >
            No predictions found matching your filters.
          </div>
        )}

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
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
                border: "1px solid #e5e7eb",
                background: "white",
                fontSize: "12px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                color: page === 1 ? "#d1d5db" : "#374151",
              }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                  cursor: "pointer",
                  background: page === p ? "#16a34a" : "white",
                  color: page === p ? "white" : "#374151",
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
                border: "1px solid #e5e7eb",
                background: "white",
                fontSize: "12px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                color: page === totalPages ? "#d1d5db" : "#374151",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

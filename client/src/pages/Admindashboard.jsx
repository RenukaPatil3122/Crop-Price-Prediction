import { useState, useEffect, useCallback } from "react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "agrisense_admin_token";

const C = {
  bg: "#0f1923",
  surface: "#162130",
  surfaceHi: "#1c2b3a",
  border: "#1e3248",
  accent: "#22c55e",
  accentDim: "#166534",
  accentGlow: "rgba(34,197,94,0.15)",
  text: "#e2eaf4",
  textMuted: "#6b8aab",
  danger: "#ef4444",
  dangerDim: "#7f1d1d",
  warning: "#f59e0b",
  blue: "#38bdf8",
};

const fmtDate = (v) => {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};
const fmtPrice = (v) =>
  v == null ? "—" : `₹${Number(v).toLocaleString("en-IN")}`;
const fmtPct = (v) => (v == null ? "—" : `${(Number(v) * 100).toFixed(1)}%`);

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Outfit', sans-serif; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${C.surface}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${C.accentDim}; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  .fade-up { animation: fadeUp 0.4s ease both; }
`;

function injectCSS() {
  if (document.getElementById("agrisense-admin-css")) return;
  const s = document.createElement("style");
  s.id = "agrisense-admin-css";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

// ── Primitives ────────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, delay = 0 }) => (
  <div
    className="fade-up"
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "20px 24px",
      animationDelay: `${delay}ms`,
      ...style,
    }}
  >
    {children}
  </div>
);

const Btn = ({
  children,
  onClick,
  variant = "default",
  disabled = false,
  style = {},
}) => {
  const v = {
    default: {
      background: C.surfaceHi,
      color: C.text,
      border: `1px solid ${C.border}`,
    },
    accent: {
      background: C.accent,
      color: "#000",
      border: "none",
      fontWeight: 600,
    },
    danger: {
      background: C.dangerDim,
      color: C.danger,
      border: `1px solid ${C.danger}`,
    },
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v,
        padding: "7px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "filter .2s",
        ...style,
      }}
      onMouseEnter={(e) =>
        !disabled && (e.currentTarget.style.filter = "brightness(1.15)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, color = C.accent }) => (
  <span
    style={{
      background: `${color}22`,
      color,
      border: `1px solid ${color}44`,
      borderRadius: 6,
      padding: "2px 8px",
      fontSize: 12,
      fontFamily: "'IBM Plex Mono', monospace",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const Spinner = ({ size = 20 }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2px solid ${C.border}`,
      borderTop: `2px solid ${C.accent}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      flexShrink: 0,
    }}
  />
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color = C.accent, delay = 0 }) => (
  <Card
    delay={delay}
    style={{ display: "flex", gap: 16, alignItems: "center" }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        flexShrink: 0,
        background: `${color}1a`,
        border: `1px solid ${color}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontSize: 11,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {value ?? <Spinner size={22} />}
      </div>
    </div>
  </Card>
);

// ── Bar Charts ────────────────────────────────────────────────────────────────
const BarChart = ({
  data = [],
  valueKey = "count",
  labelKey = "label",
  color = C.accent,
  title,
}) => {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <Card>
      {title && (
        <div
          style={{
            fontSize: 12,
            color: C.textMuted,
            marginBottom: 20,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          height: 140,
        }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              height: "100%",
            }}
          >
            <div
              style={{
                flex: 1,
                width: "100%",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${(d[valueKey] / max) * 100}%`,
                  minHeight: d[valueKey] > 0 ? 4 : 0,
                  background: `linear-gradient(180deg, ${color}, ${color}88)`,
                  borderRadius: "4px 4px 0 0",
                  position: "relative",
                  transition: "height 0.8s cubic-bezier(.4,0,.2,1)",
                }}
              >
                {d[valueKey] > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -20,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: 11,
                      color,
                      fontFamily: "'IBM Plex Mono', monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d[valueKey]}
                  </div>
                )}
              </div>
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.textMuted,
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {d[labelKey]}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const HorizBar = ({ data = [] }) => {
  const max = Math.max(...data.map((d) => d.count), 1);
  const colors = [C.accent, C.blue, C.warning, "#a78bfa", "#fb923c"];
  return (
    <Card>
      <div
        style={{
          fontSize: 12,
          color: C.textMuted,
          marginBottom: 20,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Top 5 Crops
      </div>
      {data.length === 0 ? (
        <div style={{ color: C.textMuted, fontSize: 13 }}>
          No prediction data yet
        </div>
      ) : (
        data.map((d, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              <span style={{ textTransform: "capitalize" }}>{d.crop}</span>
              <span
                style={{
                  color: colors[i],
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {d.count}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: C.border,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(d.count / max) * 100}%`,
                  background: colors[i],
                  borderRadius: 3,
                  transition: "width 0.9s cubic-bezier(.4,0,.2,1)",
                }}
              />
            </div>
          </div>
        ))
      )}
    </Card>
  );
};

// ── Table ─────────────────────────────────────────────────────────────────────
const Table = ({ columns, rows, onDelete }) => {
  const [deletingId, setDeletingId] = useState(null);
  const handleDelete = async (row) => {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    setDeletingId(row._id);
    await onDelete(row._id);
    setDeletingId(null);
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  color: C.textMuted,
                  fontWeight: 500,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </th>
            ))}
            <th style={{ padding: "10px 14px" }} />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                style={{
                  padding: "32px 14px",
                  textAlign: "center",
                  color: C.textMuted,
                }}
              >
                No records found
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr
              key={row._id ?? i}
              style={{
                borderBottom: `1px solid ${C.border}22`,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = C.surfaceHi)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "11px 14px",
                    color: C.text,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : (row[col.key] ?? "—")}
                </td>
              ))}
              <td style={{ padding: "11px 14px" }}>
                <Btn
                  variant="danger"
                  onClick={() => handleDelete(row)}
                  disabled={deletingId === row._id}
                  style={{ padding: "4px 10px", fontSize: 12 }}
                >
                  {deletingId === row._id ? <Spinner size={14} /> : "✕ Delete"}
                </Btn>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Search Bar ────────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "9px 14px",
        color: C.text,
        fontSize: 13,
        fontFamily: "'Outfit', sans-serif",
        outline: "none",
        width: "100%",
        maxWidth: 340,
      }}
      onFocus={(e) => (e.target.style.borderColor = C.accent)}
      onBlur={(e) => (e.target.style.borderColor = C.border)}
    />
  </div>
);

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid password");
      sessionStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${C.accentGlow} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        className="fade-up"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: "40px 44px",
          width: "100%",
          maxWidth: 400,
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${C.accentDim}, ${C.accent})`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              marginBottom: 16,
              boxShadow: `0 0 32px ${C.accentGlow}`,
            }}
          >
            🌾
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>AgriSense</div>
          <div
            style={{
              fontSize: 12,
              color: C.textMuted,
              marginTop: 4,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Admin Dashboard
          </div>
        </div>

        <label
          style={{
            fontSize: 12,
            color: C.textMuted,
            display: "block",
            marginBottom: 8,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Admin Password
        </label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Enter password…"
          style={{
            width: "100%",
            background: C.surfaceHi,
            border: `1px solid ${err ? C.danger : C.border}`,
            borderRadius: 8,
            padding: "11px 14px",
            color: C.text,
            fontSize: 14,
            fontFamily: "'IBM Plex Mono', monospace",
            outline: "none",
            marginBottom: 12,
          }}
          onFocus={(e) => (e.target.style.borderColor = C.accent)}
          onBlur={(e) =>
            (e.target.style.borderColor = err ? C.danger : C.border)
          }
        />
        {err && (
          <div
            style={{
              color: C.danger,
              fontSize: 13,
              marginBottom: 12,
              padding: "8px 12px",
              background: `${C.danger}11`,
              borderRadius: 6,
            }}
          >
            {err}
          </div>
        )}
        <Btn
          variant="accent"
          onClick={submit}
          disabled={loading || !pw}
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "11px 0",
            fontSize: 15,
          }}
        >
          {loading ? (
            <>
              <Spinner size={16} /> Verifying…
            </>
          ) : (
            "Sign In →"
          )}
        </Btn>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  injectCSS();

  const [token, setToken] = useState(
    () => sessionStorage.getItem(TOKEN_KEY) || "",
  );
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const authHeaders = {
    "x-admin-token": token,
    "Content-Type": "application/json",
  };

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: authHeaders,
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, refreshKey]); // eslint-disable-line

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setStats(null);
  };

  const deleteUser = async (id) => {
    await fetch(`${BACKEND_URL}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    setStats((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u._id !== id),
      totalUsers: prev.totalUsers - 1,
    }));
  };
  const deletePrediction = async (id) => {
    await fetch(`${BACKEND_URL}/api/admin/predictions/${id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    setStats((prev) => ({
      ...prev,
      predictions: prev.predictions.filter((p) => p._id !== id),
      totalPredictions: prev.totalPredictions - 1,
    }));
  };

  if (!token) return <LoginScreen onLogin={setToken} />;

  const q = search.toLowerCase();
  const filteredUsers = (stats?.users ?? []).filter(
    (u) =>
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
  );
  const filteredPreds = (stats?.predictions ?? []).filter(
    (p) =>
      p.crop?.toLowerCase().includes(q) || p.state?.toLowerCase().includes(q),
  );

  const TABS = ["overview", "users", "predictions"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: `${C.surface}ee`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.border}`,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🌾</span>
          <span style={{ color: C.textMuted, fontSize: 14 }}>AgriSense</span>
          <span style={{ color: C.border }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.accent }}>
            Admin Dashboard
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {loading && <Spinner />}
          <Btn onClick={() => setRefreshKey((k) => k + 1)} disabled={loading}>
            ↺ Refresh
          </Btn>
          <Btn
            variant="danger"
            onClick={handleLogout}
            style={{ padding: "7px 12px" }}
          >
            ⏻ Logout
          </Btn>
        </div>
      </div>

      <div
        style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 28px 60px" }}
      >
        {/* Error banner */}
        {error && (
          <div
            style={{
              background: `${C.danger}11`,
              border: `1px solid ${C.danger}44`,
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 20,
              color: C.danger,
              fontSize: 13,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <StatCard
            label="Total Users"
            value={stats?.totalUsers}
            icon="👤"
            color={C.accent}
            delay={0}
          />
          <StatCard
            label="Total Predictions"
            value={stats?.totalPredictions}
            icon="📊"
            color={C.blue}
            delay={60}
          />
          <StatCard
            label="Predictions This Week"
            value={stats?.weekPredictions}
            icon="📈"
            color={C.warning}
            delay={120}
          />
          <StatCard
            label="New Users This Week"
            value={stats?.newUsersThisWeek}
            icon="✨"
            color="#a78bfa"
            delay={180}
          />
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 24,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setSearch("");
              }}
              style={{
                background: "none",
                border: "none",
                borderBottom:
                  tab === t ? `2px solid ${C.accent}` : "2px solid transparent",
                color: tab === t ? C.accent : C.textMuted,
                padding: "10px 18px",
                fontSize: 14,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: tab === t ? 600 : 400,
                cursor: "pointer",
                transition: "color 0.2s",
                textTransform: "capitalize",
              }}
            >
              {t === "overview"
                ? "📋 Overview"
                : t === "users"
                  ? `👤 Users (${stats?.totalUsers ?? "…"})`
                  : `📊 Predictions (${stats?.totalPredictions ?? "…"})`}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div
            className="fade-up"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <BarChart
              data={stats?.signupsByDay ?? []}
              valueKey="count"
              labelKey="label"
              color={C.accent}
              title="User Signups — Last 7 Days"
            />
            <HorizBar data={stats?.topCrops ?? []} />
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="fade-up">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by name or email…"
            />
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <Table
                columns={[
                  { key: "name", label: "Name" },
                  {
                    key: "email",
                    label: "Email",
                    render: (v) => (
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 12,
                        }}
                      >
                        {v ?? "—"}
                      </span>
                    ),
                  },
                  {
                    key: "created_at",
                    label: "Joined",
                    render: (v) => (
                      <Badge color={C.textMuted}>{fmtDate(v)}</Badge>
                    ),
                  },
                ]}
                rows={filteredUsers}
                onDelete={deleteUser}
              />
            </Card>
          </div>
        )}

        {/* Predictions */}
        {tab === "predictions" && (
          <div className="fade-up">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by crop or state…"
            />
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <Table
                columns={[
                  {
                    key: "crop",
                    label: "Crop",
                    render: (v) => (
                      <span style={{ textTransform: "capitalize" }}>
                        {v ?? "—"}
                      </span>
                    ),
                  },
                  { key: "state", label: "State" },
                  {
                    key: "predicted_price",
                    label: "Price",
                    render: (v) => (
                      <Badge color={C.accent}>{fmtPrice(v)}</Badge>
                    ),
                  },
                  {
                    key: "confidence",
                    label: "Confidence",
                    render: (v) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 4,
                            background: C.border,
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${(Number(v) || 0) * 100}%`,
                              background:
                                Number(v) > 0.7
                                  ? C.accent
                                  : Number(v) > 0.4
                                    ? C.warning
                                    : C.danger,
                              borderRadius: 2,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                          }}
                        >
                          {fmtPct(v)}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: "created_at",
                    label: "Date",
                    render: (v) => (
                      <Badge color={C.textMuted}>{fmtDate(v)}</Badge>
                    ),
                  },
                ]}
                rows={filteredPreds}
                onDelete={deletePrediction}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

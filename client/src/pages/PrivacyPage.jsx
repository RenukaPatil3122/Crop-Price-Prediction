import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Trash2,
  Eye,
  AlertTriangle,
  Database,
  Server,
} from "lucide-react";

const BASE = "http://localhost:8000";

function DeleteConfirm({
  isDark,
  cardBorder,
  cardShadow,
  text,
  token,
  logout,
  navigate,
  onCancel,
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/auth/delete-account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to delete account");
      logout();
      navigate("/register");
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  };
  return (
    <div
      style={{
        background: isDark ? "rgba(248,113,113,0.05)" : "#fff5f5",
        borderRadius: "14px",
        padding: "18px",
        border: "1px solid rgba(248,113,113,0.25)",
      }}
    >
      <p
        style={{
          fontSize: "13px",
          color: text,
          marginBottom: "6px",
          fontWeight: 700,
        }}
      >
        ⚠️ Are you absolutely sure?
      </p>
      <p
        style={{
          fontSize: "12px",
          color: isDark ? "#94a3b8" : "#4b5563",
          marginBottom: "14px",
          lineHeight: 1.6,
        }}
      >
        This removes your account from the database. Prediction history stays in
        MongoDB unless cleared manually.
      </p>
      {error && (
        <p
          style={{
            fontSize: "12px",
            color: "#f87171",
            marginBottom: "10px",
            fontWeight: 600,
          }}
        >
          ❌ {error}
        </p>
      )}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            padding: "10px 22px",
            borderRadius: "10px",
            background: deleting
              ? "#475569"
              : "linear-gradient(135deg,#b91c1c,#ef4444)",
            color: "white",
            fontWeight: 800,
            fontSize: "13px",
            border: "none",
            cursor: deleting ? "not-allowed" : "pointer",
            boxShadow: deleting ? "none" : "0 4px 16px rgba(239,68,68,0.35)",
            transition: "all 0.18s",
          }}
        >
          {deleting ? "Deleting…" : "Yes, delete my account"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 22px",
            borderRadius: "10px",
            background: "transparent",
            color: isDark ? "#94a3b8" : "#4b5563",
            fontWeight: 700,
            fontSize: "13px",
            border: `1px solid ${cardBorder}`,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  const { isDark } = useTheme();
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const text = isDark ? "#e8edf8" : "#0f172a";
  const muted = isDark ? "#94a3b8" : "#4b5563";
  const cardShadow = isDark
    ? "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
    : "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)";

  const Card = ({ children, style = {} }) => (
    <div
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

  const InfoCard = ({ icon: Icon, title, color, rows }) => (
    <Card style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "18px",
          position: "relative",
        }}
      >
        <div
          style={{
            background: `${color}15`,
            border: `1px solid ${color}28`,
            borderRadius: "10px",
            padding: "8px",
            display: "flex",
          }}
        >
          <Icon style={{ width: "15px", height: "15px", color }} />
        </div>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 800,
            color: text,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </span>
      </div>
      {rows.map(([label, val], i) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom:
              i < rows.length - 1
                ? `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
                : "none",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: muted,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: text,
              textAlign: "right",
              maxWidth: "60%",
              wordBreak: "break-word",
            }}
          >
            {val}
          </span>
        </div>
      ))}
    </Card>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .pv-fade-1 { animation: fadeUp 0.45s 0.00s ease both; }
        .pv-fade-2 { animation: fadeUp 0.45s 0.07s ease both; }
        .pv-fade-3 { animation: fadeUp 0.45s 0.14s ease both; }
        .pv-fade-4 { animation: fadeUp 0.45s 0.21s ease both; }
        .del-btn { transition: all 0.18s ease; }
        .del-btn:hover { background: rgba(248,113,113,0.12) !important; transform: translateY(-1px); }

        /* Privacy hero banner */
        .pv-hero {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: nowrap;
        }

        /* Info cards grid */
        .pv-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 640px) {
          .pv-grid {
            grid-template-columns: 1fr !important;
          }
          .pv-hero {
            flex-wrap: wrap;
            gap: 14px;
          }
        }
      `}</style>

      <div className="pv-fade-1">
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: text,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Privacy & Security
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: muted,
            marginTop: "4px",
            fontWeight: 400,
          }}
        >
          How AgriSense handles your data
        </p>
      </div>

      {/* Hero banner */}
      <div
        className="pv-fade-2"
        style={{
          background:
            "linear-gradient(135deg,#0a1628 0%,#0f1f3d 50%,#1e3a5f 100%)",
          borderRadius: "22px",
          border: "1px solid rgba(96,165,250,0.15)",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background:
              "linear-gradient(90deg,transparent,rgba(96,165,250,0.3),transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(52,211,153,0.1) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="pv-hero">
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "rgba(52,211,153,0.12)",
              border: "1px solid rgba(52,211,153,0.2)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 20px rgba(52,211,153,0.15)",
            }}
          >
            <Shield
              style={{ width: "26px", height: "26px", color: "#34d399" }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#e8edf8",
                letterSpacing: "-0.02em",
              }}
            >
              Your privacy matters
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                marginTop: "4px",
                lineHeight: "1.65",
              }}
            >
              AgriSense stores only what's essential. No ads, no tracking, no
              data selling. Your predictions and alerts stay in your MongoDB
              Atlas instance.
            </div>
          </div>
        </div>
      </div>

      {/* Info cards grid */}
      <div className="pv-fade-3 pv-grid">
        <InfoCard
          icon={Database}
          title="Your Data"
          color="#34d399"
          rows={[
            ["Account email", user?.email || "—"],
            ["Predictions", "Saved to MongoDB Atlas"],
            ["Passwords", "bcrypt hashed, never plain text"],
            ["Auth tokens", "JWT, 7-day expiry, localStorage"],
            ["Analytics", "None — zero tracking"],
          ]}
        />
        <InfoCard
          icon={Eye}
          title="What We Collect"
          color="#a78bfa"
          rows={[
            ["Name & email", "Required for account"],
            ["Location", "Optional, for context"],
            ["Predictions", "Crop, state, price, date"],
            ["Price alerts", "Your threshold rules"],
            ["Ads / tracking", "❌ Never"],
          ]}
        />
        <InfoCard
          icon={Lock}
          title="Security Measures"
          color="#22d3ee"
          rows={[
            ["Password hashing", "bcrypt (industry standard)"],
            ["Auth tokens", "HS256 JWT signed server-side"],
            ["DB connection", "MongoDB Atlas with TLS"],
            ["CORS", "Restricted to localhost in dev"],
            ["Token expiry", "Auto-logout after 7 days"],
          ]}
        />
        <InfoCard
          icon={Server}
          title="Infrastructure"
          color="#fbbf24"
          rows={[
            ["Backend", "FastAPI + Python 3.12"],
            ["Database", "MongoDB Atlas (cloud)"],
            ["ML model", "Stored in server/model.pkl"],
            ["Frontend", "React (Vite), runs in browser"],
            ["Hosting", "Local / self-hosted"],
          ]}
        />
      </div>

      {/* Danger zone */}
      <div
        className="pv-fade-4"
        style={{
          background: isDark ? "rgba(20,8,8,0.9)" : "#fff5f5",
          borderRadius: "22px",
          border: "1px solid rgba(248,113,113,0.3)",
          padding: "28px",
          position: "relative",
          overflow: "hidden",
          boxShadow: isDark
            ? "0 4px 32px rgba(239,68,68,0.08)"
            : "0 4px 16px rgba(239,68,68,0.06)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background:
              "linear-gradient(90deg,transparent,rgba(248,113,113,0.5),transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-20px",
            width: "130px",
            height: "130px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(248,113,113,0.1) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: "12px",
              padding: "10px",
              display: "flex",
              boxShadow: "0 0 16px rgba(248,113,113,0.12)",
            }}
          >
            <AlertTriangle
              style={{ width: "18px", height: "18px", color: "#f87171" }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#f87171",
                letterSpacing: "-0.01em",
              }}
            >
              Danger Zone
            </div>
            <div
              style={{
                fontSize: "11px",
                color: isDark ? "rgba(248,113,113,0.6)" : "rgba(185,28,28,0.6)",
                fontWeight: 600,
                marginTop: "1px",
              }}
            >
              Irreversible actions — proceed with caution
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: "13px",
            color: muted,
            marginBottom: "20px",
            lineHeight: "1.65",
            position: "relative",
          }}
        >
          Deleting your account will sign you out immediately. Your prediction
          history and alerts in MongoDB will not be automatically removed.
        </p>

        {!showDeleteConfirm ? (
          <button
            className="del-btn"
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: "11px 22px",
              borderRadius: "12px",
              background: "transparent",
              border: "1.5px solid rgba(248,113,113,0.4)",
              color: "#f87171",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Trash2 style={{ width: "14px", height: "14px" }} /> Delete My
            Account
          </button>
        ) : (
          <DeleteConfirm
            isDark={isDark}
            cardBorder={cardBorder}
            cardShadow={cardShadow}
            text={text}
            token={token}
            logout={logout}
            navigate={navigate}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </div>
    </div>
  );
}

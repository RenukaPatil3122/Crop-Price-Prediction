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
  Key,
  Server,
} from "lucide-react";

export default function PrivacyPage() {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const card = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e5e7eb";
  const text = isDark ? "#f1f5f9" : "#1f2937";
  const muted = isDark ? "#94a3b8" : "#6b7280";
  const bg2 = isDark ? "#0f172a" : "#f8fafc";

  const InfoCard = ({ icon: Icon, title, color, rows }) => (
    <div
      style={{
        background: card,
        borderRadius: "16px",
        border: `1px solid ${border}`,
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon style={{ width: "16px", height: "16px", color }} />
        </div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: text }}>
          {title}
        </div>
      </div>
      {rows.map(([label, val], i) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom: i < rows.length - 1 ? `1px solid ${border}` : "none",
          }}
        >
          <span style={{ fontSize: "13px", color: muted }}>{label}</span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: text,
              textAlign: "right",
              maxWidth: "55%",
            }}
          >
            {val}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1
          style={{ fontSize: "22px", fontWeight: 700, color: text, margin: 0 }}
        >
          Privacy & Security
        </h1>
        <p style={{ fontSize: "13px", color: muted, marginTop: "4px" }}>
          How AgriSense handles your data
        </p>
      </div>

      {/* Hero banner */}
      <div
        style={{
          background: "linear-gradient(135deg,#1e3a5f,#1e293b)",
          borderRadius: "16px",
          border: "1px solid #334155",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            background: "rgba(22,163,74,0.15)",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Shield style={{ width: "26px", height: "26px", color: "#16a34a" }} />
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9" }}>
            Your privacy matters
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#94a3b8",
              marginTop: "4px",
              lineHeight: "1.6",
            }}
          >
            AgriSense stores only what's essential. No ads, no tracking, no data
            selling. Your predictions and alerts stay in your MongoDB Atlas
            instance.
          </div>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <InfoCard
          icon={Database}
          title="Your Data"
          color="#16a34a"
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
          color="#6366f1"
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
          color="#0891b2"
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
          color="#f59e0b"
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
        style={{
          background: isDark ? "rgba(239,68,68,0.06)" : "#fff5f5",
          borderRadius: "16px",
          border: "1px solid rgba(239,68,68,0.25)",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <AlertTriangle
            style={{ width: "18px", height: "18px", color: "#ef4444" }}
          />
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#ef4444" }}>
            Danger Zone
          </div>
        </div>
        <p
          style={{
            fontSize: "13px",
            color: muted,
            marginBottom: "16px",
            lineHeight: "1.6",
          }}
        >
          Deleting your account will sign you out immediately. Your prediction
          history and alerts in MongoDB will not be automatically removed (you'd
          need to clear those manually from Atlas).
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              background: "transparent",
              border: "1.5px solid #ef4444",
              color: "#ef4444",
              fontWeight: 600,
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
          <div
            style={{
              background: card,
              borderRadius: "12px",
              padding: "18px",
              border: `1px solid ${border}`,
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: text,
                marginBottom: "14px",
                fontWeight: 600,
              }}
            >
              ⚠️ Are you absolutely sure? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "9px",
                  background: "#ef4444",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Yes, delete everything
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "9px",
                  background: isDark ? "#334155" : "#f3f4f6",
                  color: text,
                  fontWeight: 600,
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

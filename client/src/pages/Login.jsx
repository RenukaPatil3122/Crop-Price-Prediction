import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sprout, Mail, Lock, Eye, EyeOff, TrendingUp } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3320 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Background decorations */}
      <div
        style={{
          position: "fixed",
          top: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(22,163,74,0.08)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-80px",
          left: "-80px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(22,163,74,0.05)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg,#15803d,#16a34a)",
                padding: "12px",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(22,163,74,0.4)",
              }}
            >
              <Sprout
                style={{ width: "24px", height: "24px", color: "white" }}
              />
            </div>
            <div style={{ textAlign: "left" }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "white",
                  margin: 0,
                }}
              >
                AgriSense
              </h1>
              <p
                style={{
                  fontSize: "12px",
                  color: "#16a34a",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Price Intelligence
              </p>
            </div>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "8px" }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: "20px",
            border: "1px solid #334155",
            padding: "32px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* Stats strip */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.2)",
              borderRadius: "12px",
              padding: "12px",
              marginBottom: "24px",
            }}
          >
            {[
              ["9", "Crops"],
              ["9", "States"],
              ["92%+", "Accuracy"],
            ].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#16a34a",
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#94a3b8",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "15px",
                    height: "15px",
                    color: "#64748b",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: "100%",
                    padding: "11px 12px 11px 38px",
                    borderRadius: "10px",
                    border: "1.5px solid #334155",
                    background: "#0f172a",
                    color: "#f1f5f9",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#94a3b8",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "15px",
                    height: "15px",
                    color: "#64748b",
                  }}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  style={{
                    width: "100%",
                    padding: "11px 40px 11px 38px",
                    borderRadius: "10px",
                    border: "1.5px solid #334155",
                    background: "#0f172a",
                    color: "#f1f5f9",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    display: "flex",
                  }}
                >
                  {showPwd ? (
                    <EyeOff style={{ width: "15px", height: "15px" }} />
                  ) : (
                    <Eye style={{ width: "15px", height: "15px" }} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#ef4444",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "12px",
                background: loading
                  ? "#334155"
                  : "linear-gradient(135deg,#15803d,#16a34a)",
                color: "white",
                fontWeight: 700,
                fontSize: "15px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 16px rgba(22,163,74,0.4)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "20px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#334155" }} />
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              New to AgriSense?
            </span>
            <div style={{ flex: 1, height: "1px", background: "#334155" }} />
          </div>

          <Link
            to="/register"
            style={{
              display: "block",
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1.5px solid #334155",
              background: "transparent",
              color: "#94a3b8",
              fontWeight: 600,
              fontSize: "14px",
              textAlign: "center",
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.2s",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#16a34a";
              e.target.style.color = "#16a34a";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#334155";
              e.target.style.color = "#94a3b8";
            }}
          >
            Create Free Account
          </Link>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#475569",
            fontSize: "12px",
            marginTop: "16px",
          }}
        >
          🌾 Empowering Indian farmers with AI-driven price intelligence
        </p>
      </div>
    </div>
  );
}

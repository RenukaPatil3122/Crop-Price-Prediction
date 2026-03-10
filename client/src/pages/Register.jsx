import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sprout, Mail, Lock, Eye, EyeOff, User, MapPin } from "lucide-react";

// ── MUST be outside Register() — defined inside = remounts on every keystroke ──
function Field({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  required = true,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "14px" }}>
      <label
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#94a3b8",
          display: "block",
          marginBottom: "6px",
        }}
      >
        {label}
        {!required && (
          <span style={{ color: "#475569", fontWeight: 400 }}> (optional)</span>
        )}
      </label>
      <div style={{ position: "relative" }}>
        <Icon
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "15px",
            height: "15px",
            color: focused ? "#16a34a" : "#64748b",
            pointerEvents: "none",
          }}
        />
        <input
          type={type || "text"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            width: "100%",
            padding: "11px 12px 11px 38px",
            borderRadius: "10px",
            border: `1.5px solid ${focused ? "#16a34a" : "#334155"}`,
            background: "#0f172a",
            color: "#f1f5f9",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            boxShadow: focused ? "0 0 0 3px rgba(22,163,74,0.12)" : "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.location);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
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
            Create your free account
          </p>
        </div>

        <div
          style={{
            background: "#1e293b",
            borderRadius: "20px",
            border: "1px solid #334155",
            padding: "32px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          <form onSubmit={handleSubmit} noValidate>
            <Field
              icon={User}
              label="Full Name"
              value={form.name}
              onChange={set("name")}
              placeholder="Username"
            />
            <Field
              icon={Mail}
              label="Email Address"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              type="email"
            />
            <Field
              icon={MapPin}
              label="Location"
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. Delhi, India"
              required={false}
            />

            <div style={{ marginBottom: "14px" }}>
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
                    pointerEvents: "none",
                  }}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
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
                    padding: 0,
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
                Confirm Password
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
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
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
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
              </div>
            </div>

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
              }}
            >
              {loading ? "Creating account…" : "Create Free Account →"}
            </button>
          </form>

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
              Already have an account?
            </span>
            <div style={{ flex: 1, height: "1px", background: "#334155" }} />
          </div>

          <Link
            to="/login"
            style={{
              display: "block",
              textAlign: "center",
              padding: "12px",
              borderRadius: "12px",
              border: "1.5px solid #334155",
              color: "#94a3b8",
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: "none",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#16a34a";
              e.currentTarget.style.color = "#16a34a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#334155";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            Sign In Instead
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

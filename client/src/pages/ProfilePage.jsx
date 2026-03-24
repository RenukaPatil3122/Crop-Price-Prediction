import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  User,
  MapPin,
  Phone,
  Leaf,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Calendar,
  Shield,
} from "lucide-react";

const BASE = "http://localhost:8000";
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

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const { isDark } = useTheme();

  const [form, setForm] = useState({
    name: user?.name || "",
    location: user?.location || "",
    phone: user?.phone || "",
    farm_size: user?.farm_size || "",
    crop_focus: user?.crop_focus || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pwdForm, setPwdForm] = useState({ old: "", new: "", confirm: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const text = isDark ? "#e8edf8" : "#0f172a";
  const muted = isDark ? "#94a3b8" : "#4b5563";
  const cardShadow = isDark
    ? "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
    : "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)";
  const inputBg = isDark ? "rgba(15,23,42,0.8)" : "#f8fafc";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const setPwd = (f) => (e) =>
    setPwdForm((p) => ({ ...p, [f]: e.target.value }));
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`${BASE}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Update failed");
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!pwdForm.old || !pwdForm.new) {
      setPwdMsg("❌ Fill in both fields");
      return;
    }
    if (pwdForm.new.length < 6) {
      setPwdMsg("❌ New password must be 6+ chars");
      return;
    }
    if (pwdForm.new !== pwdForm.confirm) {
      setPwdMsg("❌ Passwords don't match");
      return;
    }
    setPwdSaving(true);
    setPwdMsg("");
    try {
      const params = new URLSearchParams({
        old_password: pwdForm.old,
        new_password: pwdForm.new,
      });
      const res = await fetch(`${BASE}/auth/change-password?${params}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setPwdMsg("✅ Password changed!");
      setPwdForm({ old: "", new: "", confirm: "" });
    } catch (e) {
      setPwdMsg(`❌ ${e.message}`);
    } finally {
      setPwdSaving(false);
      setTimeout(() => setPwdMsg(""), 4000);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px 10px 36px",
    borderRadius: "12px",
    border: `1px solid ${inputBorder}`,
    background: inputBg,
    color: isDark ? "#f1f5f9" : "#111827",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontWeight: 500,
  };

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

  const FieldRow = ({
    icon: Icon,
    label,
    field,
    placeholder,
    type = "text",
  }) => (
    <div>
      <label
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: muted,
          display: "block",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon
          style={{
            position: "absolute",
            left: "11px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "14px",
            height: "14px",
            color: "#34d399",
          }}
        />
        <input
          type={type}
          value={form[field]}
          onChange={set(field)}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(52,211,153,0.5)";
            e.target.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = inputBorder;
            e.target.style.boxShadow = "none";
          }}
        />
      </div>
    </div>
  );

  const infoRows = [
    { icon: User, label: "Username", value: user?.name || "—" },
    { icon: MapPin, label: "Location", value: user?.location || "Not set" },
    { icon: Phone, label: "Phone", value: user?.phone || "Not set" },
    { icon: Leaf, label: "Crop Focus", value: user?.crop_focus || "Not set" },
    { icon: Shield, label: "Account type", value: "Farmer" },
    {
      icon: Calendar,
      label: "Member since",
      value: user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { 0%{opacity:0;transform:scale(0.92) translateY(10px)} 60%{transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }
        .pf-fade-1 { animation: fadeUp 0.45s 0.00s ease both; }
        .pf-fade-2 { animation: fadeUp 0.45s 0.07s ease both; }
        .pf-save-btn { transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        .pf-save-btn:not(:disabled):hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 24px rgba(22,163,74,0.4) !important; }
        .pf-info-row { transition: background 0.15s; border-radius: 10px; }
        .pf-info-row:hover { background: ${isDark ? "rgba(52,211,153,0.04)" : "#f0fdf4"} !important; }
        ${isDark ? "select option { background:#1e293b; color:#f1f5f9; }" : ""}
      `}</style>

      {/* Header */}
      <div className="pf-fade-1">
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: text,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          My Profile
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: muted,
            marginTop: "4px",
            fontWeight: 400,
          }}
        >
          Manage your account information
        </p>
      </div>

      <div
        className="pf-fade-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* ── LEFT — Avatar + Info card ── */}
        <Card style={{ padding: "0", overflow: "hidden" }}>
          {/* Green gradient header section */}
          <div
            style={{
              background: "linear-gradient(135deg,#166534 0%,#16a34a 100%)",
              padding: "28px 24px 20px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "1px",
                background:
                  "linear-gradient(90deg,transparent,rgba(52,211,153,0.5),transparent)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "-30px",
                right: "-20px",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(52,211,153,0.15) 0%,transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Avatar */}
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "22px",
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: 800,
                color: "white",
                margin: "0 auto 14px",
                boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
              }}
            >
              {initials}
            </div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              {user?.name || "User"}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(167,243,208,0.9)",
                marginTop: "4px",
                fontWeight: 500,
              }}
            >
              {user?.email}
            </div>

            {/* Live badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                marginTop: "10px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(52,211,153,0.3)",
                borderRadius: "20px",
                padding: "4px 10px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#34d399",
                  boxShadow: "0 0 6px rgba(52,211,153,0.6)",
                }}
              />
              <span
                style={{ fontSize: "11px", color: "#a7f3d0", fontWeight: 700 }}
              >
                Active Account
              </span>
            </div>
          </div>

          {/* Info grid — 2 columns compact */}
          <div style={{ padding: "12px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {infoRows.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "12px",
                    background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "5px",
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "7px",
                        background: isDark ? "rgba(52,211,153,0.1)" : "#f0fdf4",
                        border: `1px solid ${isDark ? "rgba(52,211,153,0.15)" : "rgba(22,163,74,0.15)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        style={{
                          width: "11px",
                          height: "11px",
                          color: "#34d399",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: muted,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      paddingLeft: "2px",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── RIGHT — Edit form ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card style={{ padding: "26px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
                position: "relative",
              }}
            >
              <div
                style={{
                  background: isDark ? "rgba(52,211,153,0.1)" : "#f0fdf4",
                  border: "1px solid rgba(52,211,153,0.2)",
                  borderRadius: "10px",
                  padding: "8px",
                  display: "flex",
                }}
              >
                <User
                  style={{ width: "15px", height: "15px", color: "#34d399" }}
                />
              </div>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: text,
                  letterSpacing: "-0.02em",
                }}
              >
                Personal Information
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <FieldRow
                icon={User}
                label="Full Name"
                field="name"
                placeholder="Your full name"
              />
              <FieldRow
                icon={Phone}
                label="Phone Number"
                field="phone"
                placeholder="+91 98765 43210"
              />
              <FieldRow
                icon={MapPin}
                label="Location"
                field="location"
                placeholder="City, State"
              />
              <FieldRow
                icon={Leaf}
                label="Farm Size"
                field="farm_size"
                placeholder="e.g. 5 acres"
              />
            </div>

            <div style={{ marginTop: "14px" }}>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: muted,
                  display: "block",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Primary Crop Focus
              </label>
              <div style={{ position: "relative" }}>
                <Leaf
                  style={{
                    position: "absolute",
                    left: "11px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "14px",
                    height: "14px",
                    color: "#34d399",
                  }}
                />
                <select
                  value={form.crop_focus}
                  onChange={set("crop_focus")}
                  style={{
                    ...inputStyle,
                    appearance: "none",
                    WebkitAppearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    paddingRight: "32px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(52,211,153,0.5)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = inputBorder;
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="">Select primary crop...</option>
                  {CROPS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: isDark ? "rgba(248,113,113,0.08)" : "#fef2f2",
                  border: "1px solid rgba(248,113,113,0.25)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginTop: "14px",
                  fontSize: "13px",
                  color: "#f87171",
                  fontWeight: 500,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              className="pf-save-btn"
              onClick={handleSave}
              disabled={saving}
              style={{
                marginTop: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 24px",
                borderRadius: "12px",
                background: saved
                  ? "#34d399"
                  : "linear-gradient(135deg,#166534 0%,#16A34A 100%)",
                color: "white",
                fontWeight: 800,
                fontSize: "13px",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saved ? (
                <>
                  <CheckCircle style={{ width: "15px", height: "15px" }} />{" "}
                  Saved!
                </>
              ) : (
                <>
                  <Save style={{ width: "15px", height: "15px" }} />{" "}
                  {saving ? "Saving…" : "Save Changes"}
                </>
              )}
            </button>
          </Card>

          {/* Change password */}
          <Card style={{ padding: "26px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
                position: "relative",
              }}
            >
              <div
                style={{
                  background: isDark ? "rgba(96,165,250,0.1)" : "#eff6ff",
                  border: "1px solid rgba(96,165,250,0.2)",
                  borderRadius: "10px",
                  padding: "8px",
                  display: "flex",
                }}
              >
                <Lock
                  style={{ width: "15px", height: "15px", color: "#60a5fa" }}
                />
              </div>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: text,
                  letterSpacing: "-0.02em",
                }}
              >
                Change Password
              </span>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {[
                {
                  label: "Current Password",
                  key: "old",
                  show: showOld,
                  toggle: () => setShowOld(!showOld),
                },
                {
                  label: "New Password",
                  key: "new",
                  show: showNew,
                  toggle: () => setShowNew(!showNew),
                },
                {
                  label: "Confirm New",
                  key: "confirm",
                  show: showNew,
                  toggle: null,
                },
              ].map(({ label, key, show, toggle }) => (
                <div key={key}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: muted,
                      display: "block",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    {label}
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock
                      style={{
                        position: "absolute",
                        left: "11px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "14px",
                        height: "14px",
                        color: "#34d399",
                      }}
                    />
                    <input
                      type={show ? "text" : "password"}
                      value={pwdForm[key]}
                      onChange={setPwd(key)}
                      placeholder="••••••••"
                      style={{
                        ...inputStyle,
                        paddingRight: toggle ? "40px" : "12px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(52,211,153,0.5)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(52,211,153,0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = inputBorder;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    {toggle && (
                      <button
                        type="button"
                        onClick={toggle}
                        style={{
                          position: "absolute",
                          right: "11px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: muted,
                          display: "flex",
                        }}
                      >
                        {show ? (
                          <EyeOff style={{ width: "14px", height: "14px" }} />
                        ) : (
                          <Eye style={{ width: "14px", height: "14px" }} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pwdMsg && (
              <div
                style={{
                  fontSize: "13px",
                  marginTop: "10px",
                  color: pwdMsg.startsWith("✅") ? "#34d399" : "#f87171",
                  fontWeight: 600,
                }}
              >
                {pwdMsg}
              </div>
            )}

            <button
              className="pf-save-btn"
              onClick={handlePasswordChange}
              disabled={pwdSaving}
              style={{
                marginTop: "14px",
                padding: "10px 20px",
                borderRadius: "12px",
                background: isDark ? "rgba(30,41,59,0.8)" : "#f8fafc",
                color: text,
                fontWeight: 700,
                fontSize: "13px",
                border: `1px solid ${cardBorder}`,
                cursor: pwdSaving ? "not-allowed" : "pointer",
                boxShadow: cardShadow,
              }}
            >
              {pwdSaving ? "Changing…" : "Change Password"}
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

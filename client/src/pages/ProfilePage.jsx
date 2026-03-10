import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Leaf,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

const BASE = "http://localhost:8000";

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

  // Password change
  const [pwdForm, setPwdForm] = useState({ old: "", new: "", confirm: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  const card = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#f3f4f6";
  const text = isDark ? "#f1f5f9" : "#1f2937";
  const muted = isDark ? "#94a3b8" : "#9ca3af";
  const inputBg = isDark ? "#0f172a" : "#f9fafb";

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
    } catch (err) {
      setError(err.message);
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
      const res = await fetch(
        `${BASE}/auth/change-password?old_password=${encodeURIComponent(pwdForm.old)}&new_password=${encodeURIComponent(pwdForm.new)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setPwdMsg("✅ Password changed!");
      setPwdForm({ old: "", new: "", confirm: "" });
    } catch (err) {
      setPwdMsg(`❌ ${err.message}`);
    } finally {
      setPwdSaving(false);
      setTimeout(() => setPwdMsg(""), 3000);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px 10px 36px",
    borderRadius: "10px",
    border: `1.5px solid ${border}`,
    background: inputBg,
    color: text,
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

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
          fontSize: "12px",
          fontWeight: 600,
          color: muted,
          display: "block",
          marginBottom: "5px",
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
            color: "#16a34a",
          }}
        />
        <input
          type={type}
          value={form[field]}
          onChange={set(field)}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
          onBlur={(e) => (e.target.style.borderColor = border)}
        />
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1
          style={{ fontSize: "22px", fontWeight: 700, color: text, margin: 0 }}
        >
          My Profile
        </h1>
        <p style={{ fontSize: "13px", color: muted, marginTop: "4px" }}>
          Manage your account information
        </p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}
      >
        {/* Avatar card */}
        <div
          style={{
            background: card,
            borderRadius: "16px",
            border: `1px solid ${border}`,
            padding: "28px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg,#15803d,#16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 800,
              color: "white",
              boxShadow: "0 8px 24px rgba(22,163,74,0.35)",
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: text }}>
              {user?.name || "User"}
            </div>
            <div
              style={{ fontSize: "12px", color: "#16a34a", marginTop: "2px" }}
            >
              {user?.email}
            </div>
          </div>
          {user?.location && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                color: muted,
              }}
            >
              <MapPin style={{ width: "12px", height: "12px" }} />{" "}
              {user.location}
            </div>
          )}
          <div
            style={{
              background: isDark ? "#0f172a" : "#f0fdf4",
              border: `1px solid ${isDark ? "#334155" : "#bbf7d0"}`,
              borderRadius: "10px",
              padding: "10px 14px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{ fontSize: "10px", color: muted, marginBottom: "2px" }}
            >
              Member since
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: text }}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                fontSize: "14px",
                fontWeight: 700,
                color: text,
                marginBottom: "18px",
              }}
            >
              Personal Information
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
                  fontSize: "12px",
                  fontWeight: 600,
                  color: muted,
                  display: "block",
                  marginBottom: "5px",
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
                    color: "#16a34a",
                  }}
                />
                <select
                  value={form.crop_focus}
                  onChange={set("crop_focus")}
                  style={{ ...inputStyle, appearance: "none" }}
                >
                  <option value="">Select primary crop...</option>
                  {[
                    "Wheat",
                    "Rice",
                    "Tomato",
                    "Onion",
                    "Cotton",
                    "Maize",
                    "Potato",
                    "Mustard",
                    "Soyabean",
                  ].map((c) => (
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
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginTop: "14px",
                  fontSize: "13px",
                  color: "#ef4444",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                marginTop: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 24px",
                borderRadius: "10px",
                background: saved
                  ? "#16a34a"
                  : "linear-gradient(135deg,#15803d,#16a34a)",
                color: "white",
                fontWeight: 700,
                fontSize: "14px",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
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
          </div>

          {/* Change password */}
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
                fontSize: "14px",
                fontWeight: 700,
                color: text,
                marginBottom: "18px",
              }}
            >
              🔒 Change Password
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
                  label: "Confirm New Password",
                  key: "confirm",
                  show: showNew,
                  toggle: null,
                },
              ].map(({ label, key, show, toggle }) => (
                <div key={key}>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: muted,
                      display: "block",
                      marginBottom: "5px",
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
                        color: "#16a34a",
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
                      onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                      onBlur={(e) => (e.target.style.borderColor = border)}
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
                  color: pwdMsg.startsWith("✅") ? "#16a34a" : "#ef4444",
                }}
              >
                {pwdMsg}
              </div>
            )}
            <button
              onClick={handlePasswordChange}
              disabled={pwdSaving}
              style={{
                marginTop: "14px",
                padding: "10px 20px",
                borderRadius: "10px",
                background: isDark ? "#334155" : "#f3f4f6",
                color: text,
                fontWeight: 600,
                fontSize: "13px",
                border: `1px solid ${border}`,
                cursor: pwdSaving ? "not-allowed" : "pointer",
              }}
            >
              {pwdSaving ? "Changing…" : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

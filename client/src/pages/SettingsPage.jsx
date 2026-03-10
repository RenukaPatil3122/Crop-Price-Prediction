import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  Moon,
  Sun,
  Save,
  CheckCircle,
  Palette,
  SlidersHorizontal,
  UserCog,
  TrendingUp,
  BrainCircuit,
  CalendarDays,
} from "lucide-react";

const BASE = "http://localhost:8000";

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user, token } = useAuth();

  const [notifSettings, setNotifSettings] = useState({
    price_alerts: true,
    predictions: true,
    weekly_summary: false,
  });
  const [saved, setSaved] = useState(false);
  const [testMsg, setTestMsg] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  const card = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e5e7eb";
  const text = isDark ? "#f1f5f9" : "#1f2937";
  const muted = isDark ? "#94a3b8" : "#6b7280";
  const bg2 = isDark ? "#0f172a" : "#f8fafc";

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        background: value ? "#16a34a" : isDark ? "#475569" : "#d1d5db",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: value ? "23px" : "3px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "white",
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );

  const SectionHeader = ({ icon: Icon, title, color }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "20px",
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
  );

  const handleTestWeeklySummary = async () => {
    setTestLoading(true);
    setTestMsg("");
    try {
      const res = await fetch(`${BASE}/notifications/weekly-summary`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setTestMsg("✅ Weekly summary notification sent! Check your bell.");
    } catch (err) {
      setTestMsg(`❌ ${err.message}`);
    } finally {
      setTestLoading(false);
      setTimeout(() => setTestMsg(""), 4000);
    }
  };

  const NOTIF_ROWS = [
    {
      key: "price_alerts",
      icon: TrendingUp,
      color: "#16a34a",
      label: "Price Alerts",
      sub: "Triggered when predicted price crosses your set threshold",
      badge: "Live",
    },
    {
      key: "predictions",
      icon: BrainCircuit,
      color: "#6366f1",
      label: "Prediction Updates",
      sub: "Saved to notifications every time you click Predict",
      badge: "Live",
    },
    {
      key: "weekly_summary",
      icon: CalendarDays,
      color: "#f59e0b",
      label: "Weekly Summary",
      sub: "Auto-generated every Monday at 8:00 AM UTC (1:30 PM IST)",
      badge: "Scheduled",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1
          style={{ fontSize: "22px", fontWeight: 700, color: text, margin: 0 }}
        >
          Settings
        </h1>
        <p style={{ fontSize: "13px", color: muted, marginTop: "4px" }}>
          Customize your AgriSense experience
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Appearance */}
          <div
            style={{
              background: card,
              borderRadius: "16px",
              border: `1px solid ${border}`,
              padding: "24px",
            }}
          >
            <SectionHeader icon={Palette} title="Appearance" color="#6366f1" />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {[
                {
                  label: "Light Mode",
                  icon: Sun,
                  active: !isDark,
                  desc: "Clean & bright",
                },
                {
                  label: "Dark Mode",
                  icon: Moon,
                  active: isDark,
                  desc: "Easy on the eyes",
                },
              ].map(({ label, icon: Icon, active, desc }) => (
                <button
                  key={label}
                  onClick={toggleTheme}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: `2px solid ${active ? "#16a34a" : border}`,
                    background: active
                      ? isDark
                        ? "rgba(22,163,74,0.1)"
                        : "#f0fdf4"
                      : bg2,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: active
                        ? "rgba(22,163,74,0.15)"
                        : isDark
                          ? "#334155"
                          : "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      style={{
                        width: "17px",
                        height: "17px",
                        color: active ? "#16a34a" : muted,
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: active ? "#16a34a" : text,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: active ? "#16a34a" : muted,
                      }}
                    >
                      {active ? "Currently active ✓" : desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Account info */}
          <div
            style={{
              background: card,
              borderRadius: "16px",
              border: `1px solid ${border}`,
              padding: "24px",
            }}
          >
            <SectionHeader
              icon={UserCog}
              title="Account Info"
              color="#0891b2"
            />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {[
                { label: "Name", value: user?.name || "—" },
                { label: "Email", value: user?.email || "—" },
                { label: "Location", value: user?.location || "Not set" },
                {
                  label: "Joined",
                  value: user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: bg2,
                    borderRadius: "10px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: muted }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: text,
                      maxWidth: "200px",
                      textAlign: "right",
                      wordBreak: "break-all",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Notifications */}
          <div
            style={{
              background: card,
              borderRadius: "16px",
              border: `1px solid ${border}`,
              padding: "24px",
            }}
          >
            <SectionHeader
              icon={SlidersHorizontal}
              title="Notification Preferences"
              color="#f59e0b"
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {NOTIF_ROWS.map(
                ({ key, icon: Icon, color, label, sub, badge }, i) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 0",
                      borderBottom:
                        i < NOTIF_ROWS.length - 1
                          ? `1px solid ${border}`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: `${color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon style={{ width: "17px", height: "17px", color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: text,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: "20px",
                            background:
                              badge === "Live"
                                ? "rgba(22,163,74,0.15)"
                                : "rgba(245,158,11,0.15)",
                            color: badge === "Live" ? "#16a34a" : "#f59e0b",
                          }}
                        >
                          {badge === "Live" ? "● Live" : "⏰ Scheduled"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: muted,
                          marginTop: "2px",
                        }}
                      >
                        {sub}
                      </div>
                    </div>
                    <Toggle
                      value={notifSettings[key]}
                      onChange={(v) =>
                        setNotifSettings((p) => ({ ...p, [key]: v }))
                      }
                    />
                  </div>
                ),
              )}
            </div>

            {/* Test weekly summary */}
            {notifSettings.weekly_summary && (
              <div
                style={{
                  marginTop: "14px",
                  paddingTop: "14px",
                  borderTop: `1px solid ${border}`,
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: muted,
                    marginBottom: "10px",
                  }}
                >
                  Don't want to wait till Monday? Trigger it now:
                </p>
                <button
                  onClick={handleTestWeeklySummary}
                  disabled={testLoading}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "9px",
                    background: isDark ? "#334155" : "#f3f4f6",
                    color: text,
                    fontWeight: 600,
                    fontSize: "12px",
                    border: `1px solid ${border}`,
                    cursor: testLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <CalendarDays
                    style={{ width: "14px", height: "14px", color: "#f59e0b" }}
                  />
                  {testLoading ? "Generating…" : "Send Weekly Summary Now"}
                </button>
                {testMsg && (
                  <p
                    style={{
                      fontSize: "12px",
                      marginTop: "8px",
                      color: testMsg.startsWith("✅") ? "#16a34a" : "#ef4444",
                    }}
                  >
                    {testMsg}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Save */}
          <button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2500);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "11px 28px",
              borderRadius: "12px",
              background: saved
                ? "#16a34a"
                : "linear-gradient(135deg,#15803d,#16a34a)",
              color: "white",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
              width: "fit-content",
            }}
          >
            {saved ? (
              <>
                <CheckCircle style={{ width: "15px", height: "15px" }} /> Saved!
              </>
            ) : (
              <>
                <Save style={{ width: "15px", height: "15px" }} /> Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

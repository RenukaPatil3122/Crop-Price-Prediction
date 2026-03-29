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

  /* ── tokens ── */
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const text = isDark ? "#e8edf8" : "#0f172a";
  const muted = isDark ? "#94a3b8" : "#4b5563";
  const cardShadow = isDark
    ? "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
    : "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)";
  const rowBg = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";

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

  const SectionHeader = ({ icon: Icon, title, color }) => (
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
          background: `${color}15`,
          border: `1px solid ${color}25`,
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
  );

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        background: value
          ? "#34d399"
          : isDark
            ? "rgba(255,255,255,0.1)"
            : "#d1d5db",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
        boxShadow: value ? "0 0 10px rgba(52,211,153,0.3)" : "none",
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
      setTestMsg("✅ Weekly summary sent! Check your bell.");
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
      color: "#34d399",
      label: "Price Alerts",
      sub: "Triggered when predicted price crosses your set threshold",
      badge: "Live",
    },
    {
      key: "predictions",
      icon: BrainCircuit,
      color: "#a78bfa",
      label: "Prediction Updates",
      sub: "Saved to notifications every time you click Predict",
      badge: "Live",
    },
    {
      key: "weekly_summary",
      icon: CalendarDays,
      color: "#fbbf24",
      label: "Weekly Summary",
      sub: "Auto-generated every Monday at 8:00 AM UTC (1:30 PM IST)",
      badge: "Scheduled",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .st-fade-1 { animation: fadeUp 0.45s 0.00s ease both; }
        .st-fade-2 { animation: fadeUp 0.45s 0.07s ease both; }
        .st-save-btn { transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        .st-save-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 24px rgba(22,163,74,0.4) !important; }
        .theme-btn { transition: all 0.2s ease; }
        .theme-btn:hover { transform: translateY(-1px); }

        /* ── Responsive grid ── */
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 640px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="st-fade-1">
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: text,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: muted,
            marginTop: "4px",
            fontWeight: 400,
          }}
        >
          Customize your AgriSense experience
        </p>
      </div>

      <div className="st-fade-2 settings-grid">
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Appearance */}
          <Card style={{ padding: "24px" }}>
            <SectionHeader icon={Palette} title="Appearance" color="#a78bfa" />
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
                  className="theme-btn"
                  onClick={toggleTheme}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: `1.5px solid ${active ? "rgba(52,211,153,0.4)" : cardBorder}`,
                    background: active
                      ? isDark
                        ? "rgba(52,211,153,0.08)"
                        : "#f0fdf4"
                      : isDark
                        ? "rgba(255,255,255,0.03)"
                        : "#f8fafc",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    textAlign: "left",
                    width: "100%",
                    boxShadow: active
                      ? "0 0 20px rgba(52,211,153,0.1)"
                      : "none",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "11px",
                      background: active
                        ? "rgba(52,211,153,0.12)"
                        : isDark
                          ? "rgba(255,255,255,0.05)"
                          : "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: `1px solid ${active ? "rgba(52,211,153,0.25)" : cardBorder}`,
                    }}
                  >
                    <Icon
                      style={{
                        width: "17px",
                        height: "17px",
                        color: active ? "#34d399" : muted,
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: active ? "#34d399" : text,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: active ? "#34d399" : muted,
                        marginTop: "1px",
                      }}
                    >
                      {active ? "Currently active ✓" : desc}
                    </div>
                  </div>
                  {active && (
                    <div
                      style={{
                        marginLeft: "auto",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#34d399",
                        boxShadow: "0 0 8px rgba(52,211,153,0.6)",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Account info */}
          <Card style={{ padding: "24px" }}>
            <SectionHeader
              icon={UserCog}
              title="Account Info"
              color="#22d3ee"
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
                    background: rowBg,
                    borderRadius: "12px",
                    border: `1px solid ${cardBorder}`,
                  }}
                >
                  <span
                    style={{ fontSize: "12px", color: muted, fontWeight: 600 }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: text,
                      maxWidth: "200px",
                      textAlign: "right",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Card style={{ padding: "24px" }}>
            <SectionHeader
              icon={SlidersHorizontal}
              title="Notification Preferences"
              color="#fbbf24"
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
                          ? `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "11px",
                        background: `${color}15`,
                        border: `1px solid ${color}25`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon style={{ width: "17px", height: "17px", color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: text,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "20px",
                            background:
                              badge === "Live"
                                ? "rgba(52,211,153,0.12)"
                                : "rgba(251,191,36,0.12)",
                            color: badge === "Live" ? "#34d399" : "#fbbf24",
                            border: `1px solid ${badge === "Live" ? "rgba(52,211,153,0.2)" : "rgba(251,191,36,0.2)"}`,
                            whiteSpace: "nowrap",
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
                          wordBreak: "break-word",
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

            {notifSettings.weekly_summary && (
              <div
                style={{
                  marginTop: "14px",
                  paddingTop: "14px",
                  borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
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
                    borderRadius: "10px",
                    background: isDark ? "rgba(30,41,59,0.8)" : "#f8fafc",
                    color: text,
                    fontWeight: 700,
                    fontSize: "12px",
                    border: `1px solid ${cardBorder}`,
                    cursor: testLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    boxShadow: cardShadow,
                  }}
                >
                  <CalendarDays
                    style={{ width: "14px", height: "14px", color: "#fbbf24" }}
                  />
                  {testLoading ? "Generating…" : "Send Weekly Summary Now"}
                </button>
                {testMsg && (
                  <p
                    style={{
                      fontSize: "12px",
                      marginTop: "8px",
                      color: testMsg.startsWith("✅") ? "#34d399" : "#f87171",
                      fontWeight: 600,
                    }}
                  >
                    {testMsg}
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Save button — outside grid, always centered */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          className="st-save-btn"
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "13px 48px",
            borderRadius: "14px",
            background: saved
              ? "#34d399"
              : "linear-gradient(135deg,#166534 0%,#16A34A 100%)",
            color: "white",
            fontWeight: 800,
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
            letterSpacing: "0.01em",
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
  );
}

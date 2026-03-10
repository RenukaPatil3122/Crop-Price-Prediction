import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Moon,
  Sun,
  Bell,
  X,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Shield,
  ChevronDown,
  Trash2,
  ToggleLeft,
  ToggleRight,
  BellOff,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  getNotifications,
  markAllRead,
  clearNotifications,
  getAlerts,
  createAlert,
  deleteAlert,
  toggleAlert,
} from "../api";

const greetingByHour = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};
const formatDate = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
const CROP_EMOJI = {
  Wheat: "🌾",
  Rice: "🍚",
  Tomato: "🍅",
  Onion: "🧅",
  Cotton: "🌿",
  Maize: "🌽",
  Soyabean: "🫘",
  Potato: "🥔",
  Mustard: "🌻",
};

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [tab, setTab] = useState("notifications");

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifsLoading, setNotifsLoading] = useState(false);

  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  const [newCrop, setNewCrop] = useState("Wheat");
  const [newCondition, setNewCondition] = useState("above");
  const [newThreshold, setNewThreshold] = useState("");
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [searchVal, setSearchVal] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const bg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e5e7eb";
  const text = isDark ? "#f1f5f9" : "#1f2937";
  const muted = isDark ? "#94a3b8" : "#6b7280";
  const inputBg = isDark ? "#334155" : "#f9fafb";
  const iconBg = isDark ? "#334155" : "#f3f4f6";
  const menuBg = isDark ? "#1e293b" : "white";
  const menuMuted = isDark ? "#64748b" : "#9ca3af";
  const panelBg = isDark ? "#0f172a" : "#f8fafc";

  // ── User display ──────────────────────────────────────────────────────────
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const firstName = userName.split(" ")[0];

  // ── Notifications ─────────────────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    setNotifsLoading(true);
    try {
      const res = await getNotifications(20);
      setNotifications(res.data || []);
      setUnreadCount(res.unread || 0);
    } catch {
    } finally {
      setNotifsLoading(false);
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const res = await getAlerts();
      setAlerts(res.data || []);
    } catch {
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (notifOpen && tab === "alerts") loadAlerts();
  }, [notifOpen, tab, loadAlerts]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Alert actions ─────────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((p) => p.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };
  const handleClearAll = async () => {
    try {
      await clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };
  const handleCreateAlert = async () => {
    if (
      !newThreshold ||
      isNaN(Number(newThreshold)) ||
      Number(newThreshold) <= 0
    ) {
      setSaveMsg("❌ Enter a valid price threshold");
      setTimeout(() => setSaveMsg(""), 2500);
      return;
    }
    setSaving(true);
    try {
      const res = await createAlert(
        newCrop,
        newCondition,
        Number(newThreshold),
        newNote,
      );
      setAlerts((p) => [res, ...p]);
      setNewThreshold("");
      setNewNote("");
      setSaveMsg("✅ Alert created!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch {
      setSaveMsg("❌ Failed to save alert");
      setTimeout(() => setSaveMsg(""), 2500);
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteAlert = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts((p) => p.filter((a) => a.id !== id));
    } catch {}
  };
  const handleToggleAlert = async (id, currentActive) => {
    try {
      await toggleAlert(id, !currentActive);
      setAlerts((p) =>
        p.map((a) => (a.id === id ? { ...a, active: !currentActive } : a)),
      );
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filtered =
    searchVal.length > 0
      ? CROPS.filter((c) => c.toLowerCase().includes(searchVal.toLowerCase()))
      : [];

  const timeAgo = (iso) => {
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div
      style={{
        height: "65px",
        borderBottom: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: "28px",
        background: bg,
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Greeting */}
      <div>
        <h2
          style={{ fontSize: "18px", fontWeight: 700, color: text, margin: 0 }}
        >
          {greetingByHour()}, {firstName}! 👋
        </h2>
        <p
          style={{
            fontSize: "12px",
            color: "#16a34a",
            fontWeight: 600,
            margin: 0,
          }}
        >
          {formatDate()}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: searchFocus
                ? isDark
                  ? "#3d4f6b"
                  : "white"
                : inputBg,
              border: `1.5px solid ${searchFocus ? "#16a34a" : border}`,
              borderRadius: "10px",
              padding: "0 14px",
              height: "36px",
              width: "220px",
              transition: "all 0.2s",
              boxShadow: searchFocus
                ? "0 0 0 3px rgba(22,163,74,0.15)"
                : "none",
            }}
          >
            <Search
              style={{
                width: "14px",
                height: "14px",
                color: searchFocus ? "#16a34a" : muted,
                flexShrink: 0,
              }}
            />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
              placeholder="Search crops..."
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "13px",
                color: isDark ? "#f1f5f9" : "#1f2937",
                width: "100%",
              }}
            />
            {searchVal && (
              <button
                onClick={() => setSearchVal("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                }}
              >
                <X style={{ width: "13px", height: "13px", color: muted }} />
              </button>
            )}
          </div>
          {searchFocus && filtered.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "42px",
                left: 0,
                right: 0,
                background: menuBg,
                border: `1px solid ${border}`,
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                overflow: "hidden",
                zIndex: 200,
              }}
            >
              {filtered.map((crop) => (
                <div
                  key={crop}
                  onMouseDown={() => setSearchVal(crop)}
                  style={{
                    padding: "9px 14px",
                    fontSize: "13px",
                    color: text,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {CROP_EMOJI[crop] || "🌾"} {crop}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: iconBg,
            border: `1px solid ${border}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isDark ? (
            <Sun style={{ width: "16px", height: "16px", color: "#fbbf24" }} />
          ) : (
            <Moon style={{ width: "16px", height: "16px", color: "#6b7280" }} />
          )}
        </button>

        {/* Bell */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: notifOpen ? (isDark ? "#334155" : "#f0fdf4") : iconBg,
              border: `1px solid ${notifOpen ? "#16a34a" : border}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Bell
              style={{
                width: "16px",
                height: "16px",
                color: notifOpen ? "#16a34a" : muted,
              }}
            />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  minWidth: "17px",
                  height: "17px",
                  borderRadius: "10px",
                  background: "#ef4444",
                  border: `2px solid ${bg}`,
                  color: "white",
                  fontSize: "9px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "44px",
                width: "360px",
                background: menuBg,
                border: `1px solid ${border}`,
                borderRadius: "16px",
                boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "14px 16px 0",
                  borderBottom: `1px solid ${border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{ fontSize: "14px", fontWeight: 700, color: text }}
                  >
                    🔔 Alerts & Notifications
                  </span>
                  <button
                    onClick={() => setNotifOpen(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: muted,
                      display: "flex",
                    }}
                  >
                    <X style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
                <div
                  style={{ display: "flex", gap: "4px", marginBottom: "-1px" }}
                >
                  {["notifications", "alerts"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      style={{
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        border: "none",
                        borderRadius: "8px 8px 0 0",
                        cursor: "pointer",
                        background:
                          tab === t
                            ? isDark
                              ? "#0f172a"
                              : "white"
                            : "transparent",
                        color: tab === t ? "#16a34a" : muted,
                        borderBottom:
                          tab === t
                            ? "2px solid #16a34a"
                            : "2px solid transparent",
                      }}
                    >
                      {t === "notifications"
                        ? `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`
                        : `My Alerts${alerts.length > 0 ? ` (${alerts.length})` : ""}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications tab */}
              {tab === "notifications" && (
                <div>
                  {notifications.length > 0 && (
                    <div
                      style={{
                        padding: "8px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: `1px solid ${border}`,
                      }}
                    >
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#16a34a",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        ✓ Mark all read
                      </button>
                      <button
                        onClick={handleClearAll}
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#ef4444",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        🗑 Clear all
                      </button>
                    </div>
                  )}
                  <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                    {notifsLoading ? (
                      <div
                        style={{
                          padding: "32px",
                          textAlign: "center",
                          color: muted,
                          fontSize: "13px",
                        }}
                      >
                        Loading…
                      </div>
                    ) : notifications.length === 0 ? (
                      <div
                        style={{ padding: "36px 20px", textAlign: "center" }}
                      >
                        <BellOff
                          style={{
                            width: "28px",
                            height: "28px",
                            color: muted,
                            margin: "0 auto 10px",
                            display: "block",
                          }}
                        />
                        <div style={{ fontSize: "13px", color: muted }}>
                          No notifications yet
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: muted,
                            marginTop: "4px",
                          }}
                        >
                          Set a price alert to get notified
                        </div>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id || n.created_at}
                          style={{
                            padding: "11px 16px",
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-start",
                            background: !n.read
                              ? isDark
                                ? "rgba(22,163,74,0.06)"
                                : "#f0fdf4"
                              : "transparent",
                            borderBottom: `1px solid ${isDark ? "#1e293b" : "#f9fafb"}`,
                          }}
                        >
                          <span style={{ fontSize: "18px", flexShrink: 0 }}>
                            {n.condition === "above" ? "📈" : "📉"}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "12px",
                                color: text,
                                fontWeight: !n.read ? 600 : 400,
                              }}
                            >
                              {n.message}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: muted,
                                marginTop: "3px",
                              }}
                            >
                              {timeAgo(n.created_at)}
                            </div>
                          </div>
                          {!n.read && (
                            <div
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "#16a34a",
                                marginTop: "5px",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div
                    style={{
                      padding: "10px 16px",
                      borderTop: `1px solid ${border}`,
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => setTab("alerts")}
                      style={{
                        fontSize: "12px",
                        color: "#16a34a",
                        fontWeight: 600,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      + Set a new price alert →
                    </button>
                  </div>
                </div>
              )}

              {/* Alerts tab */}
              {tab === "alerts" && (
                <div>
                  <div
                    style={{
                      padding: "14px 16px",
                      background: panelBg,
                      borderBottom: `1px solid ${border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: text,
                        marginBottom: "10px",
                      }}
                    >
                      ➕ New Price Alert
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <select
                        value={newCrop}
                        onChange={(e) => setNewCrop(e.target.value)}
                        style={{
                          padding: "7px 10px",
                          borderRadius: "8px",
                          border: `1px solid ${border}`,
                          background: menuBg,
                          color: text,
                          fontSize: "12px",
                          outline: "none",
                        }}
                      >
                        {CROPS.map((c) => (
                          <option key={c} value={c}>
                            {CROP_EMOJI[c]} {c}
                          </option>
                        ))}
                      </select>
                      <div
                        style={{
                          display: "flex",
                          background: menuBg,
                          border: `1px solid ${border}`,
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        {["above", "below"].map((c) => (
                          <button
                            key={c}
                            onClick={() => setNewCondition(c)}
                            style={{
                              flex: 1,
                              padding: "7px",
                              fontSize: "12px",
                              fontWeight: 600,
                              border: "none",
                              cursor: "pointer",
                              background:
                                newCondition === c ? "#16a34a" : "transparent",
                              color: newCondition === c ? "white" : muted,
                            }}
                          >
                            {c === "above" ? "📈 Above" : "📉 Below"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <input
                        type="number"
                        value={newThreshold}
                        onChange={(e) => setNewThreshold(e.target.value)}
                        placeholder="Price threshold ₹"
                        style={{
                          flex: 1,
                          padding: "7px 10px",
                          borderRadius: "8px",
                          border: `1px solid ${border}`,
                          background: menuBg,
                          color: text,
                          fontSize: "12px",
                          outline: "none",
                        }}
                      />
                      <input
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Note (optional)"
                        style={{
                          flex: 1,
                          padding: "7px 10px",
                          borderRadius: "8px",
                          border: `1px solid ${border}`,
                          background: menuBg,
                          color: text,
                          fontSize: "12px",
                          outline: "none",
                        }}
                      />
                    </div>
                    {saveMsg && (
                      <div
                        style={{
                          fontSize: "11px",
                          marginBottom: "6px",
                          color: saveMsg.startsWith("✅")
                            ? "#16a34a"
                            : "#ef4444",
                        }}
                      >
                        {saveMsg}
                      </div>
                    )}
                    <button
                      onClick={handleCreateAlert}
                      disabled={saving}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "8px",
                        background: saving
                          ? "#94a3b8"
                          : "linear-gradient(135deg,#166534,#16a34a)",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "12px",
                        border: "none",
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      {saving ? "Saving…" : "Create Alert"}
                    </button>
                  </div>
                  <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                    {alertsLoading ? (
                      <div
                        style={{
                          padding: "24px",
                          textAlign: "center",
                          color: muted,
                          fontSize: "13px",
                        }}
                      >
                        Loading…
                      </div>
                    ) : alerts.length === 0 ? (
                      <div
                        style={{
                          padding: "24px",
                          textAlign: "center",
                          color: muted,
                          fontSize: "12px",
                        }}
                      >
                        No alerts yet — create one above!
                      </div>
                    ) : (
                      alerts.map((a) => (
                        <div
                          key={a.id}
                          style={{
                            padding: "10px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            borderBottom: `1px solid ${isDark ? "#1e293b" : "#f9fafb"}`,
                            opacity: a.active ? 1 : 0.55,
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>
                            {CROP_EMOJI[a.crop] || "🌱"}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: text,
                              }}
                            >
                              {a.crop}{" "}
                              {a.condition === "above"
                                ? "📈 above"
                                : "📉 below"}{" "}
                              ₹{Number(a.threshold).toLocaleString()}
                            </div>
                            {a.note && (
                              <div style={{ fontSize: "10px", color: muted }}>
                                {a.note}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggleAlert(a.id, a.active)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: a.active ? "#16a34a" : muted,
                              display: "flex",
                            }}
                          >
                            {a.active ? (
                              <ToggleRight
                                style={{ width: "20px", height: "20px" }}
                              />
                            ) : (
                              <ToggleLeft
                                style={{ width: "20px", height: "20px" }}
                              />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteAlert(a.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#ef4444",
                              display: "flex",
                            }}
                          >
                            <Trash2 style={{ width: "14px", height: "14px" }} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: "relative" }} ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px 4px 4px",
              borderRadius: "12px",
              background: profileOpen
                ? isDark
                  ? "#334155"
                  : "#f0fdf4"
                : iconBg,
              border: `1.5px solid ${profileOpen ? "#16a34a" : border}`,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "linear-gradient(135deg,#15803d,#16a34a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "11px",
              }}
            >
              {initials}
            </div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: text }}>
              {firstName}
            </span>
            <ChevronDown
              style={{
                width: "13px",
                height: "13px",
                color: muted,
                transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {profileOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "48px",
                width: "260px",
                background: menuBg,
                border: `1px solid ${border}`,
                borderRadius: "16px",
                boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              {/* User info header */}
              <div
                style={{
                  padding: "16px",
                  borderBottom: `1px solid ${border}`,
                  background: isDark ? "rgba(22,163,74,0.08)" : "#f0fdf4",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg,#15803d,#16a34a)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "16px",
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div
                      style={{ fontSize: "14px", fontWeight: 700, color: text }}
                    >
                      {userName}
                    </div>
                    <div style={{ fontSize: "11px", color: "#16a34a" }}>
                      {userEmail}
                    </div>
                    {user?.location && (
                      <div
                        style={{
                          fontSize: "10px",
                          color: muted,
                          marginTop: "2px",
                        }}
                      >
                        📍 {user.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: "6px 0" }}>
                {[
                  {
                    icon: User,
                    label: "My Profile",
                    sub: "View & edit profile",
                    color: "#16a34a",
                    action: () => {
                      navigate("/profile");
                      setProfileOpen(false);
                    },
                  },
                  {
                    icon: Bell,
                    label: "Notifications",
                    sub: `${unreadCount} unread`,
                    color: "#f59e0b",
                    action: () => {
                      setProfileOpen(false);
                      setNotifOpen(true);
                    },
                  },
                  {
                    icon: Settings,
                    label: "Settings",
                    sub: "App preferences",
                    color: "#6366f1",
                    action: () => {
                      navigate("/settings");
                      setProfileOpen(false);
                    },
                  },
                  {
                    icon: Shield,
                    label: "Privacy",
                    sub: "Data & security",
                    color: "#0891b2",
                    action: () => {
                      navigate("/privacy");
                      setProfileOpen(false);
                    },
                  },
                  {
                    icon: HelpCircle,
                    label: "Help & Support",
                    sub: "FAQs & contact",
                    color: "#16a34a",
                    action: () => {
                      navigate("/help");
                      setProfileOpen(false);
                    },
                  },
                ].map(({ icon: Icon, label, sub, color, action }) => (
                  <div
                    key={label}
                    onClick={action || undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "9px 16px",
                      cursor: action ? "pointer" : "default",
                      opacity: action ? 1 : 0.5,
                    }}
                    onMouseEnter={(e) =>
                      action &&
                      (e.currentTarget.style.background = isDark
                        ? "rgba(255,255,255,0.05)"
                        : "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "9px",
                        background: `${color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon style={{ width: "15px", height: "15px", color }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: text,
                        }}
                      >
                        {label}
                      </div>
                      <div style={{ fontSize: "11px", color: menuMuted }}>
                        {sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sign Out */}
              <div
                style={{ borderTop: `1px solid ${border}`, padding: "6px 0" }}
              >
                <div
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "9px 16px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(239,68,68,0.07)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "9px",
                      background: "rgba(239,68,68,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LogOut
                      style={{
                        width: "15px",
                        height: "15px",
                        color: "#ef4444",
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#ef4444",
                      }}
                    >
                      Sign Out
                    </div>
                    <div style={{ fontSize: "11px", color: menuMuted }}>
                      End your session
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

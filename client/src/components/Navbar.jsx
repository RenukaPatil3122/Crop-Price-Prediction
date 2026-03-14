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
  Menu,
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

export default function Navbar({ onMenuClick, isMobile, isTablet }) {
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
  const [searchOpen, setSearchOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  /* ── Theme tokens ── */
  const bg = isDark
    ? "linear-gradient(90deg,#0a1628 0%,#0f1f3d 100%)"
    : "linear-gradient(90deg,#E8F5E9 0%,#F1F8F1 100%)";
  const borderCol = isDark ? "rgba(255,255,255,0.06)" : "#d1fae5";
  const text = isDark ? "#e8edf8" : "#0f172a";
  const muted = isDark ? "#94a3b8" : "#4b5563";
  const inputBg = isDark ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.8)";
  const iconBg = isDark ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,0.7)";
  const menuBg = isDark ? "#0f172a" : "white";
  const menuMuted = isDark ? "#64748b" : "#9ca3af";
  const panelBg = isDark ? "rgba(15,23,42,0.9)" : "#f8fafc";
  const dropW = isMobile ? "min(95vw,360px)" : "360px";

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const firstName = userName.split(" ")[0];

  /* ── placeholder style ── */
  useEffect(() => {
    const id = "agrisense-placeholder-style";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `.as-search-input::placeholder{color:#9ca3af!important;opacity:1}.as-input-dark::placeholder{color:#64748b!important;opacity:1}`;
      document.head.appendChild(s);
    }
  }, []);

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
    const iv = setInterval(loadNotifications, 30000);
    return () => clearInterval(iv);
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
  const handleToggleAlert = async (id, cur) => {
    try {
      await toggleAlert(id, !cur);
      setAlerts((p) =>
        p.map((a) => (a.id === id ? { ...a, active: !cur } : a)),
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

  /* ── Icon button helper ── */
  const IconBtn = ({ children, active, onClick, badge, style: s = {} }) => (
    <button
      onClick={onClick}
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "12px",
        background: active
          ? isDark
            ? "rgba(52,211,153,0.12)"
            : "#f0fdf4"
          : iconBg,
        border: `1px solid ${active ? "rgba(52,211,153,0.35)" : borderCol}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transition: "all 0.18s ease",
        boxShadow: active
          ? "0 0 12px rgba(52,211,153,0.15)"
          : isDark
            ? "none"
            : "0 1px 3px rgba(0,0,0,0.06)",
        ...s,
      }}
    >
      {children}
      {badge > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            minWidth: "17px",
            height: "17px",
            borderRadius: "10px",
            background: "#ef4444",
            border: `2px solid ${isDark ? "#0a1628" : "white"}`,
            color: "white",
            fontSize: "9px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 3px",
          }}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );

  return (
    <>
      <style>{`
        .nb-icon-btn:hover { background: ${isDark ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.95)"} !important; border-color: rgba(52,211,153,0.3) !important; }
        .nb-search-item:hover { background: ${isDark ? "rgba(52,211,153,0.06)" : "#f0fdf4"} !important; }
        .nb-profile-item:hover { background: ${isDark ? "rgba(255,255,255,0.05)" : "#f8fafc"} !important; }
        .nb-logout:hover { background: rgba(239,68,68,0.07) !important; }
        .nb-tab-btn { transition: all 0.15s; }
        .nb-tab-btn:hover { color: #34d399 !important; }
        ${isDark ? "select option { background: #1e293b; color: #f1f5f9; }" : ""}
      `}</style>

      <div
        style={{
          height: "65px",
          borderBottom: `1px solid ${borderCol}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: isMobile ? "12px" : isTablet ? "12px" : "16px",
          background: bg,
          position: "sticky",
          top: 0,
          zIndex: 40,
          backdropFilter: isDark ? "blur(12px)" : "none",
        }}
      >
        {/* ── LEFT ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile || isTablet ? "10px" : "0",
          }}
        >
          {(isMobile || isTablet) && (
            <button
              onClick={onMenuClick}
              className="nb-icon-btn"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                background: iconBg,
                border: `1px solid ${borderCol}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <Menu style={{ width: "18px", height: "18px", color: muted }} />
            </button>
          )}

          <div style={{ display: isMobile && searchOpen ? "none" : "block" }}>
            <h2
              style={{
                fontSize: isMobile ? "15px" : "18px",
                fontWeight: 800,
                color: text,
                margin: 0,
                whiteSpace: "nowrap",
                letterSpacing: "-0.02em",
              }}
            >
              {greetingByHour()}, {firstName}! 👋
            </h2>
            {!isMobile && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#34d399",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {formatDate()}
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "6px" : "10px",
          }}
        >
          {/* Search */}
          {isMobile ? (
            <>
              {searchOpen ? (
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: inputBg,
                      border: `1.5px solid rgba(52,211,153,0.5)`,
                      borderRadius: "12px",
                      padding: "0 12px",
                      height: "38px",
                      width: "180px",
                      boxShadow: "0 0 0 3px rgba(52,211,153,0.1)",
                    }}
                  >
                    <Search
                      style={{
                        width: "14px",
                        height: "14px",
                        color: "#34d399",
                        flexShrink: 0,
                      }}
                    />
                    <input
                      autoFocus
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      placeholder="Search crops..."
                      className={
                        isDark
                          ? "as-search-input as-input-dark"
                          : "as-search-input"
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        fontSize: "13px",
                        color: isDark ? "#e8edf8" : "#0f172a",
                        width: "100%",
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchVal("");
                    }}
                    className="nb-icon-btn"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "12px",
                      background: iconBg,
                      border: `1px solid ${borderCol}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X
                      style={{ width: "14px", height: "14px", color: muted }}
                    />
                  </button>
                  {searchVal && filtered.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "44px",
                        left: 0,
                        right: "44px",
                        background: menuBg,
                        border: `1px solid ${borderCol}`,
                        borderRadius: "14px",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                        overflow: "hidden",
                        zIndex: 200,
                      }}
                    >
                      {filtered.map((crop) => (
                        <div
                          key={crop}
                          className="nb-search-item"
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
                        >
                          {CROP_EMOJI[crop] || "🌾"} {crop}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="nb-icon-btn"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "12px",
                    background: iconBg,
                    border: `1px solid ${borderCol}`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Search
                    style={{ width: "16px", height: "16px", color: muted }}
                  />
                </button>
              )}
            </>
          ) : (
            /* Desktop search */
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: searchFocus
                    ? isDark
                      ? "rgba(30,41,59,0.9)"
                      : "white"
                    : inputBg,
                  border: `1.5px solid ${searchFocus ? "rgba(52,211,153,0.5)" : borderCol}`,
                  borderRadius: "12px",
                  padding: "0 14px",
                  height: "38px",
                  width: isTablet ? "170px" : "220px",
                  transition: "all 0.2s",
                  boxShadow: searchFocus
                    ? "0 0 0 3px rgba(52,211,153,0.1)"
                    : isDark
                      ? "none"
                      : "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <Search
                  style={{
                    width: "14px",
                    height: "14px",
                    color: searchFocus ? "#34d399" : muted,
                    flexShrink: 0,
                    transition: "color 0.2s",
                  }}
                />
                <input
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
                  placeholder="Search crops..."
                  className={
                    isDark ? "as-search-input as-input-dark" : "as-search-input"
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "13px",
                    color: isDark ? "#e8edf8" : "#0f172a",
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
                    <X
                      style={{ width: "13px", height: "13px", color: muted }}
                    />
                  </button>
                )}
              </div>
              {searchFocus && filtered.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "44px",
                    left: 0,
                    right: 0,
                    background: menuBg,
                    border: `1px solid ${borderCol}`,
                    borderRadius: "14px",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                    zIndex: 200,
                  }}
                >
                  {filtered.map((crop) => (
                    <div
                      key={crop}
                      className="nb-search-item"
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
                    >
                      {CROP_EMOJI[crop] || "🌾"} {crop}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme toggle */}
          {!(isMobile && searchOpen) && (
            <button
              className="nb-icon-btn"
              onClick={toggleTheme}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                background: iconBg,
                border: `1px solid ${borderCol}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.18s ease",
                boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              {isDark ? (
                <Sun
                  style={{ width: "16px", height: "16px", color: "#fbbf24" }}
                />
              ) : (
                <Moon
                  style={{ width: "16px", height: "16px", color: "#4b5563" }}
                />
              )}
            </button>
          )}

          {/* Bell */}
          {!(isMobile && searchOpen) && (
            <div style={{ position: "relative" }} ref={notifRef}>
              <button
                className="nb-icon-btn"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setProfileOpen(false);
                }}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: notifOpen
                    ? isDark
                      ? "rgba(52,211,153,0.12)"
                      : "#f0fdf4"
                    : iconBg,
                  border: `1px solid ${notifOpen ? "rgba(52,211,153,0.35)" : borderCol}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow: notifOpen
                    ? "0 0 12px rgba(52,211,153,0.15)"
                    : isDark
                      ? "none"
                      : "0 1px 3px rgba(0,0,0,0.06)",
                  transition: "all 0.18s ease",
                }}
              >
                <Bell
                  style={{
                    width: "16px",
                    height: "16px",
                    color: notifOpen ? "#34d399" : muted,
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
                      border: `2px solid ${isDark ? "#0a1628" : "white"}`,
                      color: "white",
                      fontSize: "9px",
                      fontWeight: 800,
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
                    top: "48px",
                    width: dropW,
                    background: menuBg,
                    border: `1px solid ${borderCol}`,
                    borderRadius: "18px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                    zIndex: 200,
                    overflow: "hidden",
                  }}
                >
                  {/* Shimmer top */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "15%",
                      right: "15%",
                      height: "1px",
                      background:
                        "linear-gradient(90deg,transparent,rgba(52,211,153,0.3),transparent)",
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      padding: "14px 16px 0",
                      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
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
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: text,
                          letterSpacing: "-0.01em",
                        }}
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
                      style={{
                        display: "flex",
                        gap: "4px",
                        marginBottom: "-1px",
                      }}
                    >
                      {["notifications", "alerts"].map((t) => (
                        <button
                          key={t}
                          className="nb-tab-btn"
                          onClick={() => setTab(t)}
                          style={{
                            padding: "6px 14px",
                            fontSize: "12px",
                            fontWeight: 700,
                            border: "none",
                            borderRadius: "8px 8px 0 0",
                            cursor: "pointer",
                            background:
                              tab === t
                                ? isDark
                                  ? "rgba(52,211,153,0.08)"
                                  : "white"
                                : "transparent",
                            color: tab === t ? "#34d399" : muted,
                            borderBottom:
                              tab === t
                                ? "2px solid #34d399"
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

                  {tab === "notifications" && (
                    <div>
                      {notifications.length > 0 && (
                        <div
                          style={{
                            padding: "8px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}`,
                          }}
                        >
                          <button
                            onClick={handleMarkAllRead}
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#34d399",
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
                              fontWeight: 700,
                              color: "#f87171",
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
                            style={{
                              padding: "36px 20px",
                              textAlign: "center",
                            }}
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
                                    ? "rgba(52,211,153,0.04)"
                                    : "#f0fdf4"
                                  : "transparent",
                                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "#f9fafb"}`,
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
                                    fontWeight: !n.read ? 700 : 400,
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
                                    background: "#34d399",
                                    marginTop: "5px",
                                    flexShrink: 0,
                                    boxShadow: "0 0 6px rgba(52,211,153,0.5)",
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
                          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                          textAlign: "center",
                        }}
                      >
                        <button
                          onClick={() => setTab("alerts")}
                          style={{
                            fontSize: "12px",
                            color: "#34d399",
                            fontWeight: 700,
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

                  {tab === "alerts" && (
                    <div>
                      <div
                        style={{
                          padding: "14px 16px",
                          background: panelBg,
                          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 800,
                            color: text,
                            marginBottom: "10px",
                            letterSpacing: "-0.01em",
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
                              borderRadius: "10px",
                              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                              background: isDark
                                ? "rgba(30,41,59,0.8)"
                                : "white",
                              color: isDark ? "#f1f5f9" : "#111827",
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
                              background: isDark
                                ? "rgba(30,41,59,0.8)"
                                : "white",
                              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                              borderRadius: "10px",
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
                                  fontWeight: 700,
                                  border: "none",
                                  cursor: "pointer",
                                  background:
                                    newCondition === c
                                      ? "#34d399"
                                      : "transparent",
                                  color: newCondition === c ? "#071a0e" : muted,
                                  transition: "all 0.15s",
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
                              borderRadius: "10px",
                              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                              background: isDark
                                ? "rgba(30,41,59,0.8)"
                                : "white",
                              color: isDark ? "#f1f5f9" : "#111827",
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
                              borderRadius: "10px",
                              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                              background: isDark
                                ? "rgba(30,41,59,0.8)"
                                : "white",
                              color: isDark ? "#f1f5f9" : "#111827",
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
                                ? "#34d399"
                                : "#f87171",
                              fontWeight: 600,
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
                            padding: "9px",
                            borderRadius: "10px",
                            background: saving
                              ? "#475569"
                              : "linear-gradient(135deg,#166534 0%,#16A34A 100%)",
                            color: "white",
                            fontWeight: 800,
                            fontSize: "12px",
                            border: "none",
                            cursor: saving ? "not-allowed" : "pointer",
                            boxShadow: saving
                              ? "none"
                              : "0 4px 12px rgba(22,163,74,0.3)",
                            transition: "all 0.18s",
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
                                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}`,
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
                                    fontWeight: 700,
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
                                  <div
                                    style={{ fontSize: "10px", color: muted }}
                                  >
                                    {a.note}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  handleToggleAlert(a.id, a.active)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: a.active ? "#34d399" : muted,
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
                                  color: "#f87171",
                                  display: "flex",
                                }}
                              >
                                <Trash2
                                  style={{ width: "14px", height: "14px" }}
                                />
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
          )}

          {/* Profile */}
          {!(isMobile && searchOpen) && (
            <div style={{ position: "relative" }} ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen((o) => !o);
                  setNotifOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "4px" : "8px",
                  padding: isMobile ? "4px" : "4px 12px 4px 4px",
                  borderRadius: "14px",
                  background: profileOpen
                    ? isDark
                      ? "rgba(52,211,153,0.12)"
                      : "#f0fdf4"
                    : iconBg,
                  border: `1.5px solid ${profileOpen ? "rgba(52,211,153,0.35)" : borderCol}`,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: profileOpen
                    ? "0 0 12px rgba(52,211,153,0.15)"
                    : isDark
                      ? "none"
                      : "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "9px",
                    background: "linear-gradient(135deg,#15803d,#16a34a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "11px",
                    boxShadow: "0 2px 6px rgba(22,163,74,0.35)",
                  }}
                >
                  {initials}
                </div>
                {!isMobile && (
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: text,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {firstName}
                  </span>
                )}
                {!isMobile && (
                  <ChevronDown
                    style={{
                      width: "13px",
                      height: "13px",
                      color: muted,
                      transform: profileOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                )}
              </button>

              {profileOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "52px",
                    width: isMobile ? "min(90vw,260px)" : "260px",
                    background: menuBg,
                    border: `1px solid ${borderCol}`,
                    borderRadius: "18px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                    zIndex: 200,
                    overflow: "hidden",
                  }}
                >
                  {/* Shimmer */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "15%",
                      right: "15%",
                      height: "1px",
                      background:
                        "linear-gradient(90deg,transparent,rgba(52,211,153,0.3),transparent)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* User header */}
                  <div
                    style={{
                      padding: "16px",
                      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                      background: isDark ? "rgba(52,211,153,0.06)" : "#f0fdf4",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
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
                          fontWeight: 800,
                          fontSize: "16px",
                          boxShadow: "0 4px 12px rgba(22,163,74,0.35)",
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: text,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {userName}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#34d399",
                            fontWeight: 600,
                          }}
                        >
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

                  <div style={{ padding: "6px 0" }}>
                    {[
                      {
                        icon: User,
                        label: "My Profile",
                        sub: "View & edit profile",
                        color: "#34d399",
                        action: () => {
                          navigate("/profile");
                          setProfileOpen(false);
                        },
                      },
                      {
                        icon: Bell,
                        label: "Notifications",
                        sub: `${unreadCount} unread`,
                        color: "#fbbf24",
                        action: () => {
                          setProfileOpen(false);
                          setNotifOpen(true);
                        },
                      },
                      {
                        icon: Settings,
                        label: "Settings",
                        sub: "App preferences",
                        color: "#a78bfa",
                        action: () => {
                          navigate("/settings");
                          setProfileOpen(false);
                        },
                      },
                      {
                        icon: Shield,
                        label: "Privacy",
                        sub: "Data & security",
                        color: "#22d3ee",
                        action: () => {
                          navigate("/privacy");
                          setProfileOpen(false);
                        },
                      },
                      {
                        icon: HelpCircle,
                        label: "Help & Support",
                        sub: "FAQs & contact",
                        color: "#60a5fa",
                        action: () => {
                          navigate("/help");
                          setProfileOpen(false);
                        },
                      },
                    ].map(({ icon: Icon, label, sub, color, action }) => (
                      <div
                        key={label}
                        className="nb-profile-item"
                        onClick={action}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "9px 16px",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "9px",
                            background: `${color}15`,
                            border: `1px solid ${color}25`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon
                            style={{ width: "15px", height: "15px", color }}
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
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

                  <div
                    style={{
                      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                      padding: "6px 0",
                    }}
                  >
                    <div
                      className="nb-logout"
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "9px 16px",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "9px",
                          background: "rgba(248,113,113,0.1)",
                          border: "1px solid rgba(248,113,113,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <LogOut
                          style={{
                            width: "15px",
                            height: "15px",
                            color: "#f87171",
                          }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#f87171",
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
          )}
        </div>
      </div>
    </>
  );
}

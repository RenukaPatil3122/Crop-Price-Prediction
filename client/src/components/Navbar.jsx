import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

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

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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

  const filtered =
    searchVal.length > 0
      ? CROPS.filter((c) => c.toLowerCase().includes(searchVal.toLowerCase()))
      : [];

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
        transition: "background 0.3s",
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
          {greetingByHour()}, Renuka! 👋
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
                  🌾 {crop}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Light Mode" : "Dark Mode"}
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

        {/* Notifications */}
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
              background: iconBg,
              border: `1px solid ${border}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Bell style={{ width: "16px", height: "16px", color: muted }} />
            <span
              style={{
                position: "absolute",
                top: "7px",
                right: "7px",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#ef4444",
                border: `1.5px solid ${bg}`,
              }}
            />
          </button>
          {notifOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "44px",
                width: "290px",
                background: menuBg,
                border: `1px solid ${border}`,
                borderRadius: "14px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${border}`,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{ fontSize: "13px", fontWeight: 700, color: text }}
                >
                  Notifications
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#16a34a",
                    cursor: "pointer",
                  }}
                >
                  Mark all read
                </span>
              </div>
              {[
                {
                  emoji: "📈",
                  msg: "Wheat price up 12% in Punjab",
                  time: "2 min ago",
                  dot: "#16a34a",
                  unread: true,
                },
                {
                  emoji: "🧅",
                  msg: "New prediction ready: Onion",
                  time: "15 min ago",
                  dot: "#f59e0b",
                  unread: true,
                },
                {
                  emoji: "⚠️",
                  msg: "Cotton alert: price dropped 7%",
                  time: "1 hr ago",
                  dot: "#ef4444",
                  unread: true,
                },
                {
                  emoji: "🌾",
                  msg: "Rabi harvest season started",
                  time: "3 hrs ago",
                  dot: "#16a34a",
                  unread: false,
                },
              ].map(({ emoji, msg, time, dot, unread }) => (
                <div
                  key={msg}
                  style={{
                    padding: "11px 16px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    background: unread
                      ? isDark
                        ? "rgba(22,163,74,0.05)"
                        : "#f0fdf4"
                      : "transparent",
                    cursor: "pointer",
                    borderBottom: `1px solid ${isDark ? "#1e293b" : "#f9fafb"}`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = isDark
                      ? "rgba(255,255,255,0.04)"
                      : "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = unread
                      ? isDark
                        ? "rgba(22,163,74,0.05)"
                        : "#f0fdf4"
                      : "transparent")
                  }
                >
                  <span style={{ fontSize: "16px", flexShrink: 0 }}>
                    {emoji}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: text,
                        fontWeight: unread ? 600 : 400,
                      }}
                    >
                      {msg}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: muted,
                        marginTop: "2px",
                      }}
                    >
                      {time}
                    </div>
                  </div>
                  {unread && (
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: dot,
                        marginTop: "4px",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              ))}
              <div
                style={{
                  padding: "10px 16px",
                  textAlign: "center",
                  borderTop: `1px solid ${border}`,
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#16a34a",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  View all notifications →
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ✅ RP Profile Button + Dropdown */}
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
                boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
              }}
            >
              RP
            </div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: text }}>
              Renuka
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
              {/* Profile header */}
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
                      boxShadow: "0 4px 12px rgba(22,163,74,0.35)",
                      flexShrink: 0,
                    }}
                  >
                    RP
                  </div>
                  <div>
                    <div
                      style={{ fontSize: "14px", fontWeight: 700, color: text }}
                    >
                      Renuka Patil
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#16a34a",
                        marginTop: "1px",
                      }}
                    >
                      renuka@agrisense.in
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        background: "#dcfce7",
                        color: "#16a34a",
                        padding: "1px 8px",
                        borderRadius: "20px",
                        fontWeight: 700,
                        marginTop: "4px",
                        display: "inline-block",
                      }}
                    >
                      ✦ Pro Plan
                    </span>
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
                  },
                  {
                    icon: Bell,
                    label: "Notifications",
                    sub: "3 unread alerts",
                    color: "#f59e0b",
                  },
                  {
                    icon: Settings,
                    label: "Settings",
                    sub: "App preferences",
                    color: "#6366f1",
                  },
                  {
                    icon: Shield,
                    label: "Privacy",
                    sub: "Data & security",
                    color: "#0891b2",
                  },
                  {
                    icon: HelpCircle,
                    label: "Help & Support",
                    sub: "FAQs & contact",
                    color: "#16a34a",
                  },
                ].map(({ icon: Icon, label, sub, color }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "9px 16px",
                      cursor: "pointer",
                      transition: "background 0.15s",
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
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "9px",
                        background: `${color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
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

              {/* Divider + Sign Out */}
              <div
                style={{ borderTop: `1px solid ${border}`, padding: "6px 0" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "9px 16px",
                    cursor: "pointer",
                    transition: "background 0.15s",
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

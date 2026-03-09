import { useState, useRef, useEffect } from "react";
import { Search, Moon, Sun, Bell, X } from "lucide-react";
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
  const [searchVal, setSearchVal] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const notifRef = useRef(null);

  const bg = isDark ? "#1e293b" : "white";
  const borderCol = isDark ? "#334155" : "#e5e7eb";
  const text = isDark ? "#f1f5f9" : "#1f2937";
  const muted = isDark ? "#94a3b8" : "#6b7280";
  const inputBg = isDark ? "#334155" : "#f9fafb";
  const iconBg = isDark ? "#334155" : "#f3f4f6";

  // Close notif on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
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
        borderBottom: `1px solid ${borderCol}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: "28px",
        background: bg,
        transition: "background 0.3s,color 0.3s",
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
        {/* Search with dropdown */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: searchFocus ? (isDark ? "#3d4f6b" : white) : inputBg,
              border: `1.5px solid ${searchFocus ? "#16a34a" : borderCol}`,
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
                // ✅ Key fix: explicit color so it's always visible
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

          {/* Search results dropdown */}
          {searchFocus && filtered.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "42px",
                left: 0,
                right: 0,
                background: isDark ? "#1e293b" : "white",
                border: `1px solid ${borderCol}`,
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
                    transition: "background 0.1s",
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
                  <span>🌾</span> {crop}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light" : "Switch to Dark"}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: iconBg,
            border: `1px solid ${borderCol}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
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
            onClick={() => setNotifOpen((o) => !o)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: iconBg,
              border: `1px solid ${borderCol}`,
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
                border: "1.5px solid " + bg,
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
                background: isDark ? "#1e293b" : "white",
                border: `1px solid ${borderCol}`,
                borderRadius: "14px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${borderCol}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
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
                    transition: "background 0.1s",
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
                  borderTop: `1px solid ${borderCol}`,
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

        {/* Avatar */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg,#15803d,#16a34a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
          }}
        >
          RP
        </div>
      </div>
    </div>
  );
}

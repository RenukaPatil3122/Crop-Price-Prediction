import { useState } from "react";
import { Search, Moon, Sun, Bell } from "lucide-react";
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

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);

  const bg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e5e7eb";
  const text = isDark ? "#f1f5f9" : "#1f2937";
  const muted = isDark ? "#94a3b8" : "#6b7280";

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
            fontWeight: 500,
            margin: 0,
          }}
        >
          {formatDate()}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: isDark ? "#334155" : "#f9fafb",
            border: `1px solid ${border}`,
            borderRadius: "10px",
            padding: "0 14px",
            height: "36px",
            width: "220px",
          }}
        >
          <Search style={{ width: "14px", height: "14px", color: muted }} />
          <input
            placeholder="Search crops..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "13px",
              color: text,
              width: "100%",
            }}
          />
        </div>

        {/* ✅ Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Light Mode" : "Dark Mode"}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: isDark ? "#334155" : "#f3f4f6",
            border: `1px solid ${border}`,
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

        {/* Bell with notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: isDark ? "#334155" : "#f3f4f6",
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
                top: "6px",
                right: "6px",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#ef4444",
                border: "1.5px solid white",
              }}
            />
          </button>
          {notifOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "44px",
                width: "270px",
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${border}`,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: text,
                }}
              >
                Notifications
              </div>
              {[
                {
                  msg: "Wheat price up 12% in Punjab",
                  time: "2 min ago",
                  dot: "#16a34a",
                },
                {
                  msg: "New prediction ready: Onion",
                  time: "15 min ago",
                  dot: "#f59e0b",
                },
                {
                  msg: "Cotton alert: price dropped 7%",
                  time: "1 hr ago",
                  dot: "#ef4444",
                },
              ].map(({ msg, time, dot }) => (
                <div
                  key={msg}
                  style={{
                    padding: "10px 16px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    borderBottom: `1px solid ${isDark ? "#1e293b" : "#f9fafb"}`,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: dot,
                      marginTop: "4px",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{ fontSize: "12px", color: text, fontWeight: 500 }}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "#16a34a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          RP
        </div>
      </div>
    </div>
  );
}

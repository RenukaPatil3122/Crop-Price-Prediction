import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart2,
  History,
  Sprout,
  GitCompare,
  X,
} from "lucide-react";
import WeatherWidget from "./WeatherWidget";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "My Dashboard" },
  { to: "/predictions", icon: TrendingUp, label: "Predictions" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/compare", icon: GitCompare, label: "Compare Crops" },
  { to: "/history", icon: History, label: "History" },
];

export default function Sidebar({ onNavigate }) {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const userName = user?.name || "User";
  const userSub = user?.email || "—";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* ── Theme tokens ── */
  const bg = isDark
    ? "linear-gradient(180deg,#0a1628 0%,#0f1f3d 50%,#0a1628 100%)"
    : "linear-gradient(180deg,#E8F5E9 0%,#C8E6C9 50%,#A5D6A7 100%)";
  const borderCol = isDark ? "rgba(255,255,255,0.06)" : "#A5D6A7";
  const logoTitle = isDark ? "#e8edf8" : "#166534";
  const logoSub = isDark ? "#34d399" : "#16a34a";
  const inactiveClr = isDark ? "#94a3b8" : "#166534";
  const profileBg = isDark ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,0.6)";
  const profileName = isDark ? "#e8edf8" : "#166534";
  const profileSub = isDark ? "#94a3b8" : "#16a34a";

  return (
    <>
      <style>{`
        @keyframes sideGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .nav-item { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1) !important; }
        .nav-item:hover { transform: translateX(2px); }
        .nav-item-inactive:hover {
          background: ${isDark ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.6)"} !important;
          color: ${isDark ? "#34d399" : "#166534"} !important;
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "224px",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          background: bg,
          borderRight: `1px solid ${borderCol}`,
          transition: "background 0.3s",
          overflowY: "auto",
        }}
      >
        {/* ── Logo ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 16px",
            height: "65px",
            borderBottom: `1px solid ${borderCol}`,
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle glow behind logo */}
          {isDark && (
            <div
              style={{
                position: "absolute",
                top: "-20px",
                left: "-10px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(52,211,153,0.08) 0%,transparent 70%)",
                pointerEvents: "none",
              }}
            />
          )}

          <div
            style={{
              background: "linear-gradient(135deg,#15803d,#16a34a)",
              padding: "9px",
              borderRadius: "12px",
              boxShadow: "0 4px 14px rgba(22,163,74,0.4)",
              flexShrink: 0,
            }}
          >
            <Sprout style={{ width: "18px", height: "18px", color: "white" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: logoTitle,
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              AgriSense
            </h1>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: logoSub,
                margin: 0,
              }}
            >
              Price Intelligence
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={onNavigate}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: inactiveClr,
                display: "flex",
                padding: "4px",
                borderRadius: "8px",
                flexShrink: 0,
              }}
            >
              <X style={{ width: "18px", height: "18px" }} />
            </button>
          )}
        </div>

        {/* ── Nav ── */}
        <nav
          style={{
            padding: "14px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
          }}
        >
          {/* Section label */}
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: isDark ? "rgba(148,163,184,0.5)" : "rgba(22,101,52,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "4px 14px 8px",
              marginTop: "2px",
            }}
          >
            Navigation
          </div>

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              style={{ textDecoration: "none" }}
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <div
                  className={`nav-item${isActive ? "" : " nav-item-inactive"}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    background: isActive
                      ? "linear-gradient(135deg,#166534 0%,#16a34a 100%)"
                      : "transparent",
                    color: isActive ? "white" : inactiveClr,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "13px",
                    boxShadow: isActive
                      ? "0 4px 16px rgba(22,163,74,0.35), inset 0 1px 0 rgba(255,255,255,0.15)"
                      : "none",
                    border: isActive
                      ? "1px solid rgba(52,211,153,0.2)"
                      : "1px solid transparent",
                  }}
                >
                  {/* Active shimmer */}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "10%",
                        right: "10%",
                        height: "1px",
                        background:
                          "linear-gradient(90deg,transparent,rgba(52,211,153,0.5),transparent)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <Icon
                    style={{
                      width: "16px",
                      height: "16px",
                      flexShrink: 0,
                      filter: isActive
                        ? "drop-shadow(0 0 4px rgba(52,211,153,0.5))"
                        : "none",
                    }}
                  />
                  {label}
                  {/* Active dot */}
                  {isActive && (
                    <div
                      style={{
                        marginLeft: "auto",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "rgba(52,211,153,0.8)",
                        boxShadow: "0 0 6px rgba(52,211,153,0.6)",
                      }}
                    />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />
        <WeatherWidget />

        {/* ── User Profile ── */}
        <div
          style={{
            padding: "10px",
            borderTop: `1px solid ${borderCol}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "14px",
              background: profileBg,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : borderCol}`,
              boxShadow: isDark
                ? "inset 0 1px 0 rgba(255,255,255,0.05)"
                : "none",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {isDark && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "10%",
                  right: "10%",
                  height: "1px",
                  background:
                    "linear-gradient(90deg,transparent,rgba(52,211,153,0.2),transparent)",
                  pointerEvents: "none",
                }}
              />
            )}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "linear-gradient(135deg,#15803d,#16a34a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
                fontSize: "12px",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(22,163,74,0.4)",
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: profileName,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.01em",
                }}
              >
                {userName}
              </p>
              <p
                style={{
                  fontSize: "10px",
                  color: profileSub,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userSub}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

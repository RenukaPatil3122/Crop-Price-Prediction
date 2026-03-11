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

  const bg = isDark
    ? "linear-gradient(180deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)"
    : "linear-gradient(180deg,#E8F5E9 0%,#C8E6C9 50%,#A5D6A7 100%)";
  const borderCol = isDark ? "#334155" : "#A5D6A7";
  const logoTitle = isDark ? "#f1f5f9" : "#166534";
  const logoSub = isDark ? "#94a3b8" : "#16a34a";
  const inactiveClr = isDark ? "#94a3b8" : "#166534";
  const hoverBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.55)";
  const profileBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)";
  const profileName = isDark ? "#f1f5f9" : "#166534";
  const profileSub = isDark ? "#94a3b8" : "#16a34a";

  return (
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
      {/* Logo row — close button appears on mobile (onNavigate prop set) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 16px",
          height: "65px",
          borderBottom: `1px solid ${borderCol}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#15803d,#16a34a)",
            padding: "8px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(22,163,74,0.35)",
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
            }}
          >
            AgriSense
          </h1>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: logoSub,
              margin: 0,
            }}
          >
            Price Intelligence
          </p>
        </div>
        {/* Close button — only shown when drawer (onNavigate passed) */}
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

      {/* Nav */}
      <nav
        style={{
          padding: "16px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
        }}
      >
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: isActive
                    ? isDark
                      ? "linear-gradient(135deg,#15803d,#16a34a)"
                      : "#16a34a"
                    : "transparent",
                  color: isActive ? "white" : inactiveClr,
                  fontWeight: isActive ? 700 : 500,
                  boxShadow: isActive
                    ? "0 4px 12px rgba(22,163,74,0.35)"
                    : "none",
                  fontSize: "13px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = hoverBg;
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon
                  style={{ width: "17px", height: "17px", flexShrink: 0 }}
                />
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />
      <WeatherWidget />

      {/* User Profile */}
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
            borderRadius: "12px",
            background: profileBg,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : borderCol}`,
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "linear-gradient(135deg,#15803d,#16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "11px",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
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
  );
}

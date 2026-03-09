import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart2,
  History,
  Sprout,
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronUp,
  Bell,
  Shield,
} from "lucide-react";
import WeatherWidget from "./WeatherWidget";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "My Dashboard" },
  { to: "/predictions", icon: TrendingUp, label: "Predictions" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/history", icon: History, label: "History" },
];

export default function Sidebar() {
  const { isDark } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  const bg = isDark
    ? "linear-gradient(180deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)"
    : "linear-gradient(180deg,#E8F5E9 0%,#C8E6C9 50%,#A5D6A7 100%)";
  const borderCol = isDark ? "#334155" : "#A5D6A7";
  const logoTitle = isDark ? "#f1f5f9" : "#166534";
  const logoSub = isDark ? "#94a3b8" : "#16a34a";
  const inactiveClr = isDark ? "#94a3b8" : "#166534";
  const hoverBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.5)";
  const profileBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)";
  const profileName = isDark ? "#f1f5f9" : "#166534";
  const profileSub = isDark ? "#94a3b8" : "#16a34a";
  const menuBg = isDark ? "#1e293b" : "white";
  const menuBorder = isDark ? "#334155" : "#e5e7eb";
  const menuText = isDark ? "#f1f5f9" : "#374151";
  const menuMuted = isDark ? "#64748b" : "#9ca3af";

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
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 20px",
          height: "65px",
          borderBottom: `1px solid ${borderCol}`,
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
        <div>
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
          <NavLink key={to} to={to} end style={{ textDecoration: "none" }}>
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

      {/* Weather */}
      <WeatherWidget />

      {/* Profile */}
      <div
        style={{
          padding: "10px",
          borderTop: `1px solid ${borderCol}`,
          position: "relative",
        }}
      >
        {/* Dropdown */}
        {profileOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "68px",
              left: "6px",
              right: "6px",
              background: menuBg,
              border: `1px solid ${menuBorder}`,
              borderRadius: "16px",
              boxShadow: "0 -12px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
              zIndex: 200,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "14px 16px",
                borderBottom: `1px solid ${menuBorder}`,
                background: isDark ? "rgba(22,163,74,0.08)" : "#f0fdf4",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
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
                    flexShrink: 0,
                  }}
                >
                  RP
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: menuText,
                    }}
                  >
                    Renuka Patil
                  </div>
                  <div style={{ fontSize: "11px", color: "#16a34a" }}>
                    renuka@agrisense.in
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      background: "#dcfce7",
                      color: "#16a34a",
                      padding: "1px 8px",
                      borderRadius: "20px",
                      fontWeight: 600,
                      marginTop: "3px",
                      display: "inline-block",
                    }}
                  >
                    ✦ Pro Plan
                  </span>
                </div>
              </div>
            </div>

            {/* Menu items */}
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
                  gap: "10px",
                  padding: "9px 14px",
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
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: `${color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: "13px", height: "13px", color }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: menuText,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: "10px", color: menuMuted }}>
                    {sub}
                  </div>
                </div>
              </div>
            ))}

            <div style={{ borderTop: `1px solid ${menuBorder}` }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 14px",
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
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "rgba(239,68,68,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LogOut
                  style={{ width: "13px", height: "13px", color: "#ef4444" }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#ef4444",
                  }}
                >
                  Sign Out
                </div>
                <div style={{ fontSize: "10px", color: menuMuted }}>
                  End your session
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trigger */}
        <div
          onClick={() => setProfileOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 12px",
            borderRadius: "12px",
            background: profileBg,
            cursor: "pointer",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : borderCol}`,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
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
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
            }}
          >
            RP
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
              Renuka Patil
            </p>
            <p style={{ fontSize: "10px", color: profileSub, margin: 0 }}>
              Farmer Analytics
            </p>
          </div>
          <ChevronUp
            style={{
              width: "13px",
              height: "13px",
              color: profileSub,
              flexShrink: 0,
              transform: profileOpen ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.25s",
            }}
          />
        </div>
      </div>
    </div>
  );
}

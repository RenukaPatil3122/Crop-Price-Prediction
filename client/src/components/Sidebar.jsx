import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart2,
  History,
  Sprout,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "My Dashboard" },
  { to: "/predictions", icon: TrendingUp, label: "Predictions" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/history", icon: History, label: "History" },
];

export default function Sidebar() {
  return (
    <div
      className="fixed top-0 left-0 h-screen w-56 flex flex-col z-50"
      style={{
        background:
          "linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)",
        borderRight: "1px solid #B2DFDB",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 py-5"
        style={{ borderBottom: "1px solid #A5D6A7" }}
      >
        <div className="bg-green-600 p-2 rounded-xl shadow-md">
          <Sprout className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-green-900 font-bold text-lg leading-tight">
            AgriSense
          </h1>
          <p className="text-green-600 text-xs font-medium">
            Price Intelligence
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${
                isActive
                  ? "bg-green-600 text-white font-semibold shadow-md"
                  : "text-green-800 hover:bg-green-200 hover:text-green-900"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid #A5D6A7" }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white bg-opacity-60">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shadow">
            RP
          </div>
          <div>
            <p className="text-sm font-semibold text-green-900">Renuka Patil</p>
            <p className="text-xs text-green-600">Farmer Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}

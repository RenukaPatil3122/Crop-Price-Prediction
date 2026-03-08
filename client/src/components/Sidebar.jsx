import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart2,
  History,
  Leaf,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/predictions", icon: TrendingUp, label: "Predictions" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/history", icon: History, label: "History" },
];

export default function Sidebar() {
  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-[#1B4332] flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-green-700">
        <div className="bg-[#52B788] p-2 rounded-xl">
          <Leaf className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">
            CropSage
          </h1>
          <p className="text-green-400 text-xs">Price Intelligence</p>
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
                  ? "bg-[#52B788] text-white font-semibold shadow-md"
                  : "text-green-200 hover:bg-green-700 hover:text-white"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-6 py-4 border-t border-green-700">
        <p className="text-green-400 text-xs">© 2025 CropSage</p>
      </div>
    </div>
  );
}

import { Sun, Moon, Bell, Search } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ title }) {
  const { isDark, toggleTheme } = useTheme();

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const today = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="flex items-center justify-between px-6 py-3"
      style={{
        background: "linear-gradient(90deg, #E8F5E9 0%, #F1F8F1 100%)",
        borderBottom: "1px solid #C8E6C9",
      }}
    >
      {/* Left */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          {greeting}, Renuka! 👋
        </h2>
        <p className="text-sm text-green-600 font-medium">{today}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white border border-green-200 rounded-xl px-4 py-2 shadow-sm">
          <Search className="w-4 h-4 text-green-400" />
          <input
            type="text"
            placeholder="Search crops..."
            className="text-sm text-gray-600 outline-none bg-transparent w-32"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white border border-green-200 hover:bg-green-50 transition-all shadow-sm"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-green-600" />
          )}
        </button>

        {/* Notification */}
        <button className="p-2 rounded-xl bg-white border border-green-200 hover:bg-green-50 transition-all relative shadow-sm">
          <Bell className="w-5 h-5 text-green-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
          <span className="text-white text-xs font-bold">RP</span>
        </div>
      </div>
    </div>
  );
}

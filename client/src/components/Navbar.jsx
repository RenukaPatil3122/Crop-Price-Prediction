import { Sun, Moon, Bell, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ title }) {
  const { isDark, toggleTheme } = useTheme();

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      {/* Left */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {greeting}, Renuka! 👋
        </h2>
        <p className="text-sm text-gray-400">{title}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Notification */}
        <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-all relative">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-[#52B788] flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

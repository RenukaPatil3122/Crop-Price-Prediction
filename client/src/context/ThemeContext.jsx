import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("agrisense-theme") === "dark";
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("agrisense-theme", next ? "dark" : "light");
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    document.body.style.background = isDark ? "#0f172a" : "#f0fdf4";
    document.body.style.color = isDark ? "#f1f5f9" : "#1f2937";
    document.body.style.transition = "background 0.3s, color 0.3s";
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

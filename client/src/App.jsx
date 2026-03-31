import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Predictions from "./pages/Predictions";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Compare from "./pages/Compare";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import PrivacyPage from "./pages/PrivacyPage";
import HelpPage from "./pages/HelpPage";
import AdminDashboard from "./pages/Admindashboard";

// ── Breakpoints ───────────────────────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    const w = window.innerWidth;
    if (w < 768) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  });
  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth;
      setBp(w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return bp;
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "3px solid #334155",
          borderTop: "3px solid #16a34a",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ color: "#64748b", fontSize: "14px" }}>Loading AgriSense…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Route guards ──────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

// ── Global CSS ────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.35); border-radius: 99px; transition: background 0.2s; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.65); }
  ::-webkit-scrollbar-corner { background: transparent; }
  * { scrollbar-width: thin; scrollbar-color: rgba(100,116,139,0.35) transparent; }
  * { -webkit-tap-highlight-color: transparent; }
  body { margin: 0; padding: 0; overflow-x: hidden; }
  .mobile-nav-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(2px);
    z-index: 49;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideIn { from { transform: translateX(-100%) } to { transform: translateX(0) } }
  @keyframes spin    { to   { transform: rotate(360deg) } }
`;

// ── Authenticated app shell (sidebar + navbar + pages) ────────────────────────
function AppLayout() {
  const { isDark } = useTheme();
  const bp = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDesktop = bp === "desktop";
  const showDrawer = bp === "mobile" || bp === "tablet";
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const bg = isDark ? "#0f172a" : "#f0fdf4";

  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: bg,
        position: "relative",
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {/* Desktop: fixed sidebar */}
      {isDesktop && (
        <div style={{ width: "224px", flexShrink: 0 }}>
          <Sidebar />
        </div>
      )}

      {/* Mobile / Tablet: overlay drawer */}
      {showDrawer && sidebarOpen && (
        <>
          <div
            className="mobile-nav-overlay"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              height: "100vh",
              width: isTablet ? "260px" : "224px",
              zIndex: 50,
              animation: "slideIn 0.25s ease",
            }}
          >
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Navbar
          onMenuClick={() => setSidebarOpen((o) => !o)}
          isMobile={isMobile}
          isTablet={isTablet}
          isDesktop={isDesktop}
          sidebarOpen={sidebarOpen}
        />
        <main
          style={{
            flex: 1,
            padding: isMobile ? "16px" : isTablet ? "20px" : "24px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<History />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Admin — completely standalone, no auth guards, no sidebar/navbar */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Protected app shell */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

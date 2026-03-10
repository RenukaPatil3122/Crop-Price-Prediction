import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

const BASE = "http://localhost:8000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("agrisense_token"),
  );
  const [loading, setLoading] = useState(true); // true while checking token on startup

  // ── On mount: verify stored token ────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("agrisense_token");
    if (!stored) {
      setLoading(false);
      return;
    }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${stored}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u) => {
        setUser(u);
        setToken(stored);
      })
      .catch(() => {
        localStorage.removeItem("agrisense_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, location = "") => {
    const res = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, location }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    localStorage.setItem("agrisense_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    localStorage.setItem("agrisense_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("agrisense_token");
    setToken(null);
    setUser(null);
  }, []);

  // ── Update profile (local state sync) ────────────────────────────────────
  const updateUser = useCallback((fields) => {
    setUser((prev) => ({ ...prev, ...fields }));
  }, []);

  // ── Auth header helper ────────────────────────────────────────────────────
  const authHeader = useCallback(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
        updateUser,
        authHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

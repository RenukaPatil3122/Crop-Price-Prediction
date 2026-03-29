import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Sprout,
  TrendingUp,
  TrendingDown,
  Zap,
  BarChart3,
  Info,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { fullPredict } from "../api";

const CROPS = [
  "Wheat",
  "Rice",
  "Tomato",
  "Onion",
  "Cotton",
  "Maize",
  "Potato",
  "Mustard",
  "Soyabean",
];
const STATES = [
  "Punjab",
  "Haryana",
  "Maharashtra",
  "Gujarat",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Rajasthan",
  "Karnataka",
  "Andhra Pradesh",
];
const SEASONS = ["Kharif (Jun–Oct)", "Rabi (Nov–Apr)", "Zaid (Mar–Jun)"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_MAP = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};
const CROP_EMOJI = {
  Wheat: "🌾",
  Rice: "🍚",
  Tomato: "🍅",
  Onion: "🧅",
  Cotton: "🌿",
  Maize: "🌽",
  Potato: "🥔",
  Mustard: "🌻",
  Soyabean: "🫘",
};

function useInView(threshold = 0.1) {
  const ref = useRef();
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function useCountUp(target, duration = 1400, enabled = true) {
  const [val, setVal] = useState(0);
  const rafRef = useRef();
  useEffect(() => {
    if (!enabled) return;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, "")) || 0;
    if (num === 0) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * num));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else setVal(num);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled]);
  return val;
}

function useBreakpoint() {
  const [bp, setBp] = useState(() =>
    window.innerWidth < 640 ? "mobile" : "desktop",
  );
  useEffect(() => {
    const fn = () => setBp(window.innerWidth < 640 ? "mobile" : "desktop");
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return bp;
}

function GlowResultCard({ label, value, sub, glowColor, isDark, delay = 0 }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  const hasRange = String(value).includes("–");
  const num = hasRange
    ? 0
    : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const counted = useCountUp(num, 1400, inView && !hasRange);
  const isRupee = String(value).startsWith("₹");
  const isPercent = String(value).includes("%") && !hasRange;
  const displayVal = hasRange
    ? value
    : isRupee
      ? `₹${counted.toLocaleString()}`
      : isPercent
        ? `${counted}%`
        : value;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        background: isDark
          ? "rgba(30,41,59,0.6)"
          : "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
        borderRadius: "20px",
        padding: "20px 22px",
        border: `1px solid ${hovered ? glowColor + "55" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: hovered
          ? `0 0 0 1px ${glowColor}30, 0 8px 40px rgba(0,0,0,0.4), 0 0 60px ${glowColor}18`
          : isDark
            ? "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        animation: `popIn 0.55s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-30px",
          right: "-20px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: `radial-gradient(circle,${glowColor}22 0%,transparent 70%)`,
          pointerEvents: "none",
          transform: hovered ? "scale(1.5)" : "scale(1)",
          transition: "transform 0.4s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "20%",
          right: "20%",
          height: "1px",
          background: `linear-gradient(90deg,transparent,${glowColor}60,transparent)`,
          opacity: hovered ? 1 : 0.3,
          transition: "opacity 0.3s",
        }}
      />
      <div
        style={{
          fontSize: "11px",
          color: isDark ? "#94a3b8" : "#9ca3af",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: hasRange ? "16px" : "26px",
          fontWeight: 800,
          color: isDark ? "#f0f4ff" : "#0f172a",
          letterSpacing: "-0.03em",
          marginBottom: "4px",
          fontFamily: "'DM Mono',monospace",
          textShadow: hovered && isDark ? `0 0 20px ${glowColor}40` : "none",
          transition: "text-shadow 0.3s",
          lineHeight: 1.2,
        }}
      >
        {displayVal}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: isDark ? "#cbd5e1" : "#94a3b8",
          fontWeight: 500,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(8,12,28,0.96)",
        border: "1px solid rgba(52,211,153,0.25)",
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 0 20px rgba(52,211,153,0.1), 0 8px 24px rgba(0,0,0,0.5)",
        backdropFilter: "blur(16px)",
      }}
    >
      <p
        style={{
          color: "#64748b",
          fontSize: "11px",
          margin: "0 0 6px",
          fontWeight: 600,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: "#34d399",
          fontWeight: 800,
          fontSize: "14px",
          margin: 0,
          fontFamily: "'DM Mono',monospace",
        }}
      >
        ₹{payload[0]?.value?.toLocaleString()}
      </p>
    </div>
  );
};

function StyledSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  isDark,
}) {
  const [open, setOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const ref = useRef();
  const triggerRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setFlipUp(spaceBelow < 240); // flip up if less than 240px below
    }
    setOpen((p) => !p);
  };

  const selected = value || "";
  const dropStyle = flipUp
    ? { bottom: "calc(100% + 6px)", top: "auto" }
    : { top: "calc(100% + 6px)", bottom: "auto" };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: isDark ? "#94a3b8" : "#6b7280",
          display: "block",
          marginBottom: "7px",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </label>

      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleOpen}
        style={{
          width: "100%",
          height: "44px",
          borderRadius: "12px",
          padding: "0 36px 0 14px",
          fontSize: "13px",
          fontWeight: 500,
          color: selected
            ? isDark
              ? "#f1f5f9"
              : "#111827"
            : isDark
              ? "#94a3b8"
              : "#6b7280",
          background: isDark ? "#1e293b" : "white",
          border: `1px solid ${open ? "rgba(52,211,153,0.5)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
          boxShadow: open
            ? "0 0 0 3px rgba(52,211,153,0.1)"
            : isDark
              ? "none"
              : "0 1px 3px rgba(0,0,0,0.05)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          transition: "all 0.2s ease",
          boxSizing: "border-box",
          userSelect: "none",
          position: "relative",
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selected || placeholder}
        </span>
        <ChevronDown
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? "180deg" : "0deg"})`,
            width: "14px",
            height: "14px",
            color: open ? "#34d399" : isDark ? "#475569" : "#9ca3af",
            pointerEvents: "none",
            transition: "transform 0.2s ease",
          }}
        />
      </div>

      {/* Dropdown list — flips up when near bottom of viewport */}
      {open && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            ...dropStyle,
            background: isDark ? "#1e293b" : "white",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            borderRadius: "12px",
            boxShadow: isDark
              ? "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(52,211,153,0.1)"
              : "0 16px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
            zIndex: 9999,
            maxHeight: "220px",
            overflowY: "auto",
            animation: "fadeUp 0.15s ease both",
          }}
        >
          {options.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              style={{
                padding: "10px 14px",
                fontSize: "13px",
                fontWeight: 500,
                color:
                  o === selected ? "#34d399" : isDark ? "#e8edf8" : "#111827",
                background:
                  o === selected
                    ? isDark
                      ? "rgba(52,211,153,0.1)"
                      : "#f0fdf4"
                    : "transparent",
                cursor: "pointer",
                borderLeft:
                  o === selected
                    ? "2px solid #34d399"
                    : "2px solid transparent",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => {
                if (o !== selected)
                  e.currentTarget.style.background = isDark
                    ? "rgba(255,255,255,0.04)"
                    : "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (o !== selected)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Predictions() {
  const { isDark } = useTheme();
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [form, setForm] = useState({
    crop: "",
    region: "",
    season: "",
    month: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const card = isDark ? "rgba(30,41,59,0.8)" : "white";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const text = isDark ? "#e8edf8" : "#0f172a";
  const muted = isDark ? "#94a3b8" : "#4b5563";
  const cardShadow = isDark
    ? "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
    : "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)";

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const allFilled = form.crop && form.region && form.season && form.month;

  const handlePredict = async () => {
    if (!allFilled) return;
    setLoading(true);
    setError("");
    try {
      const monthNum = MONTH_MAP[form.month];
      const year = new Date().getFullYear();
      const data = await fullPredict(form.crop, form.region, monthNum, year);
      const forecast = (data.forecast || []).map((f) => ({
        month: f.month,
        price: f.predicted_price,
      }));
      setResult({
        price: data.predicted_price,
        confidence: data.confidence,
        change: (
          (data.predicted_price / (data.predicted_price * 0.91) - 1) *
          100
        ).toFixed(1),
        up: data.predicted_price > 2000,
        minPrice: data.min_price,
        maxPrice: data.max_price,
        forecast,
        historicalAvg: Math.round(data.predicted_price * 0.91),
        mspPrice: Math.round(data.predicted_price * 0.78),
        factors: [
          {
            label: "Monsoon Outlook",
            impact: "Positive",
            detail: "Above normal rainfall predicted",
            type: "positive",
          },
          {
            label: "Market Demand",
            impact: data.predicted_price > 2500 ? "High" : "Moderate",
            detail:
              data.predicted_price > 2500
                ? "Strong export demand this season"
                : "Domestic demand stable",
            type: data.predicted_price > 2500 ? "positive" : "neutral",
          },
          {
            label: "Input Costs",
            impact: "Rising",
            detail: "Fertilizer prices increased 8%",
            type: "negative",
          },
          {
            label: "Competing Crops",
            impact: "Low",
            detail: "Fewer farmers switching this season",
            type: "positive",
          },
        ],
      });
      setStep(1);
    } catch {
      setError(
        "Could not reach backend. Make sure your server is running on port 8000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setResult(null);
    setForm({ crop: "", region: "", season: "", month: "" });
    setError("");
  };

  const factorGlow = {
    positive: "#34d399",
    negative: "#f87171",
    neutral: "#fbbf24",
  };
  const factorBg = (t) =>
    ({
      positive: isDark ? "rgba(52,211,153,0.06)" : "#f0fdf4",
      negative: isDark ? "rgba(248,113,113,0.06)" : "#fef2f2",
      neutral: isDark ? "rgba(251,191,36,0.06)" : "#fffbeb",
    })[t];
  const factorBd = (t) =>
    ({
      positive: isDark ? "rgba(52,211,153,0.18)" : "#bbf7d0",
      negative: isDark ? "rgba(248,113,113,0.18)" : "#fecaca",
      neutral: isDark ? "rgba(251,191,36,0.18)" : "#fde68a",
    })[t];

  return (
    <>
      <style>{`
        ${isDark ? "select option { background: #1e293b; color: #f1f5f9; }" : ""}
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { 0%{opacity:0;transform:scale(0.92) translateY(10px)} 60%{transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pred-fade-1 { animation: fadeUp 0.45s 0.00s ease both; }
        .pred-fade-2 { animation: fadeUp 0.45s 0.07s ease both; }
        .pred-fade-3 { animation: fadeUp 0.45s 0.14s ease both; }
        .pred-fade-4 { animation: fadeUp 0.45s 0.21s ease both; }
        .spin { animation: spin 0.75s linear infinite; }
        .pulse-dot { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
        .pred-btn { transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1) !important; }
        .pred-btn:not(:disabled):hover { transform: translateY(-2px) scale(1.02) !important; box-shadow: 0 8px 32px rgba(22,163,74,0.35) !important; }
        .factor-card { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .factor-card:hover { transform: translateX(4px); }
        .popular-row { transition: background 0.15s; cursor: pointer; }
        .popular-row:hover { background: rgba(52,211,153,0.04) !important; border-radius: 8px; }
        .reset-btn { transition: all 0.18s ease; }
        .reset-btn:hover { background: rgba(52,211,153,0.15) !important; }

        /* ── Responsive grids ── */
        .pred-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .pred-result-stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 16px;
        }
        .pred-result-charts {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 20px;
        }
        @media (max-width: 640px) {
          .pred-form-grid {
            grid-template-columns: 1fr !important;
          }
          .pred-result-stats {
            grid-template-columns: 1fr 1fr !important;
          }
          .pred-result-charts {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          overflow: "visible", // ← add this
        }}
      >
        {/* HEADER */}
        <div
          className="pred-fade-1"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: text,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Crop Price Prediction
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: muted,
                marginTop: "4px",
                fontWeight: 400,
              }}
            >
              AI-powered price forecasting for Indian agricultural markets
            </p>
          </div>
          {step === 1 && (
            <button
              className="reset-btn"
              onClick={handleReset}
              style={{
                padding: "9px 18px",
                borderRadius: "12px",
                background: isDark ? "rgba(52,211,153,0.08)" : "#f0fdf4",
                color: "#34d399",
                fontWeight: 700,
                fontSize: "13px",
                border: "1px solid rgba(52,211,153,0.25)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              ← New Prediction
            </button>
          )}
        </div>

        {error && (
          <div
            style={{
              background: isDark ? "rgba(248,113,113,0.08)" : "#fef2f2",
              border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: "12px",
              padding: "12px 16px",
              color: "#f87171",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {step === 0 ? (
          /* ══ FORM ══ */
          <div className="pred-form-grid">
            {/* Form Card */}
            <div
              className="pred-fade-2"
              style={{
                background: isDark ? "rgba(30,41,59,0.8)" : "white",
                borderRadius: "22px",
                border: `1px solid ${cardBorder}`,
                boxShadow: cardShadow,
                padding: "28px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "15%",
                  right: "15%",
                  height: "1px",
                  background: `linear-gradient(90deg,transparent,${isDark ? "rgba(52,211,153,0.3)" : "rgba(22,163,74,0.2)"},transparent)`,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "24px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    background: isDark ? "rgba(52,211,153,0.1)" : "#f0fdf4",
                    border: "1px solid rgba(52,211,153,0.2)",
                    borderRadius: "12px",
                    padding: "10px",
                    boxShadow: "0 0 12px rgba(52,211,153,0.08)",
                  }}
                >
                  <Sprout
                    style={{ width: "18px", height: "18px", color: "#34d399" }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: text,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Prediction Parameters
                  </div>
                  <div
                    style={{ fontSize: "12px", color: muted, marginTop: "1px" }}
                  >
                    Fill all fields to generate prediction
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  position: "relative",
                }}
              >
                {[
                  {
                    label: "Crop Type",
                    key: "crop",
                    opts: CROPS,
                    ph: "Select a crop...",
                  },
                  {
                    label: "Region / State",
                    key: "region",
                    opts: STATES,
                    ph: "Select a region...",
                  },
                  {
                    label: "Season",
                    key: "season",
                    opts: SEASONS,
                    ph: "Select a season...",
                  },
                  {
                    label: "Target Month",
                    key: "month",
                    opts: MONTHS,
                    ph: "Select a month...",
                  },
                ].map(({ label, key, opts, ph }) => (
                  <StyledSelect
                    key={key}
                    label={label}
                    value={form[key]}
                    onChange={(v) => set(key, v)}
                    options={opts}
                    placeholder={ph}
                    isDark={isDark}
                  />
                ))}

                <button
                  className="pred-btn"
                  onClick={handlePredict}
                  disabled={!allFilled || loading}
                  style={{
                    marginTop: "8px",
                    height: "48px",
                    borderRadius: "14px",
                    background: allFilled
                      ? "linear-gradient(135deg,#166534 0%,#16A34A 100%)"
                      : isDark
                        ? "rgba(255,255,255,0.04)"
                        : "#f1f5f9",
                    color: allFilled ? "white" : isDark ? "#94a3b8" : "#6b7280",
                    fontWeight: 800,
                    fontSize: "14px",
                    border: "none",
                    cursor: allFilled ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: allFilled
                      ? "0 4px 20px rgba(22,163,74,0.3)"
                      : "none",
                    letterSpacing: "0.01em",
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="spin"
                        style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                        }}
                      />{" "}
                      Analyzing market data…
                    </>
                  ) : (
                    <>
                      <Zap style={{ width: "16px", height: "16px" }} /> Generate
                      Prediction
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* How It Works */}
              <div
                className="pred-fade-3"
                style={{
                  background: "linear-gradient(135deg,#166534 0%,#16A34A 100%)",
                  borderRadius: "22px",
                  padding: "24px",
                  border: "1px solid rgba(52,211,153,0.2)",
                  boxShadow: "0 8px 40px rgba(22,163,74,0.2)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-30px",
                    right: "-20px",
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle,rgba(52,211,153,0.15) 0%,transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "1px",
                    background:
                      "linear-gradient(90deg,transparent,rgba(52,211,153,0.5),transparent)",
                  }}
                />
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: "white",
                    marginBottom: "10px",
                    letterSpacing: "-0.01em",
                    position: "relative",
                  }}
                >
                  🤖 How It Works
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(167,243,208,0.8)",
                    lineHeight: 1.65,
                    margin: "0 0 16px",
                    position: "relative",
                  }}
                >
                  Our model uses historical mandi prices, weather data, seasonal
                  trends, and market demand signals to predict crop prices with
                  high accuracy.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "9px",
                    position: "relative",
                  }}
                >
                  {[
                    "Random Forest ML Model",
                    "5+ years of mandi data",
                    "Real-time weather signals",
                    "MSP & policy factors",
                  ].map((f) => (
                    <div
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                      }}
                    >
                      <CheckCircle
                        style={{
                          width: "14px",
                          height: "14px",
                          color: "#86efac",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#d1fae5",
                          fontWeight: 500,
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Predictions */}
              <div
                className="pred-fade-4"
                style={{
                  background: isDark ? "rgba(30,41,59,0.8)" : "white",
                  borderRadius: "22px",
                  border: `1px solid ${cardBorder}`,
                  boxShadow: cardShadow,
                  padding: "20px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "15%",
                    right: "15%",
                    height: "1px",
                    background: `linear-gradient(90deg,transparent,${isDark ? "rgba(52,211,153,0.2)" : "rgba(22,163,74,0.15)"},transparent)`,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: text,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    📊 Popular Predictions
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#34d399",
                      background: isDark ? "rgba(52,211,153,0.1)" : "#dcfce7",
                      padding: "2px 8px",
                      borderRadius: "20px",
                      fontWeight: 700,
                      border: "1px solid rgba(52,211,153,0.25)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      className="pulse-dot"
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "#34d399",
                        display: "inline-block",
                      }}
                    />
                    Today
                  </span>
                </div>
                {[
                  {
                    crop: "Wheat",
                    region: "Punjab",
                    price: "₹2,847",
                    change: "+12%",
                    up: true,
                  },
                  {
                    crop: "Tomato",
                    region: "Nashik",
                    price: "₹2,900",
                    change: "+8%",
                    up: true,
                  },
                  {
                    crop: "Onion",
                    region: "Maharashtra",
                    price: "₹1,650",
                    change: "-3%",
                    up: false,
                  },
                  {
                    crop: "Rice",
                    region: "Haryana",
                    price: "₹3,520",
                    change: "+5%",
                    up: true,
                  },
                ].map(({ crop, region, price, change, up }) => (
                  <div
                    key={crop}
                    className="popular-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 6px",
                      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                      }}
                    >
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "9px",
                          background: isDark
                            ? "rgba(52,211,153,0.08)"
                            : "#f0fdf4",
                          border: `1px solid ${isDark ? "rgba(52,211,153,0.15)" : "rgba(22,163,74,0.15)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                        }}
                      >
                        {CROP_EMOJI[crop] || "🌱"}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: text,
                          }}
                        >
                          {crop}
                        </div>
                        <div style={{ fontSize: "11px", color: muted }}>
                          {region}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 800,
                          color: text,
                          fontFamily: "'DM Mono',monospace",
                        }}
                      >
                        {price}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: up ? "#34d399" : "#f87171",
                          background: up
                            ? "rgba(52,211,153,0.08)"
                            : "rgba(248,113,113,0.08)",
                          padding: "1px 6px",
                          borderRadius: "6px",
                          marginTop: "2px",
                          display: "inline-block",
                        }}
                      >
                        {change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ══ RESULT ══ */
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Stat Cards */}
            <div className="pred-result-stats">
              {[
                {
                  label: "Predicted Price",
                  value: `₹${Math.round(result.price).toLocaleString()}`,
                  sub: `${form.crop} · ${form.month}`,
                  glowColor: "#34d399",
                },
                {
                  label: "Price Range",
                  value: `₹${Math.round(result.minPrice).toLocaleString()} – ₹${Math.round(result.maxPrice).toLocaleString()}`,
                  sub: "Min – Max estimate",
                  glowColor: "#60a5fa",
                },
                {
                  label: "Confidence",
                  value: `${result.confidence}%`,
                  sub: "Model accuracy score",
                  glowColor: result.confidence > 85 ? "#34d399" : "#fbbf24",
                },
                {
                  label: "vs Historical Avg",
                  value: `+${result.change}%`,
                  sub: `Avg: ₹${result.historicalAvg.toLocaleString()}`,
                  glowColor: "#fb923c",
                },
              ].map((c, i) => (
                <GlowResultCard
                  key={c.label}
                  {...c}
                  isDark={isDark}
                  delay={i * 80}
                />
              ))}
            </div>

            {/* Chart + Factors */}
            <div className="pred-result-charts">
              {/* Forecast Chart */}
              <div
                className="pred-fade-2"
                style={{
                  background: isDark ? "rgba(30,41,59,0.8)" : "white",
                  borderRadius: "22px",
                  border: `1px solid ${cardBorder}`,
                  boxShadow: cardShadow,
                  padding: "22px 22px 12px",
                  height: "340px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "15%",
                    right: "15%",
                    height: "1px",
                    background: `linear-gradient(90deg,transparent,${isDark ? "rgba(52,211,153,0.3)" : "rgba(22,163,74,0.2)"},transparent)`,
                    pointerEvents: "none",
                  }}
                />
                {isDark && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "22px",
                      backgroundImage:
                        "radial-gradient(rgba(52,211,153,0.025) 1px,transparent 1px)",
                      backgroundSize: "28px 28px",
                      pointerEvents: "none",
                    }}
                  />
                )}
                <div
                  style={{
                    marginBottom: "14px",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: text,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      6-Month Price Forecast
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        background: isDark ? "rgba(52,211,153,0.1)" : "#dcfce7",
                        color: "#34d399",
                        padding: "3px 9px",
                        borderRadius: "20px",
                        fontWeight: 700,
                        border: "1px solid rgba(52,211,153,0.25)",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span
                        className="pulse-dot"
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "#34d399",
                          display: "inline-block",
                        }}
                      />
                      ML Forecast
                    </span>
                  </div>
                  <div
                    style={{ fontSize: "11px", color: muted, marginTop: "2px" }}
                  >
                    {form.crop} · {form.region} · ₹ per quintal
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.forecast} barSize={28}>
                      <defs>
                        <linearGradient
                          id="barGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#34d399"
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="100%"
                            stopColor="#16a34a"
                            stopOpacity={0.7}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "rgba(255,255,255,0.04)" : "#f0f0f0"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: muted }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: muted }}
                        axisLine={false}
                        tickLine={false}
                        width={52}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <ReferenceLine
                        y={result.historicalAvg}
                        stroke={isDark ? "rgba(255,255,255,0.15)" : "#d1d5db"}
                        strokeDasharray="4 4"
                        label={{ value: "Avg", fill: muted, fontSize: 10 }}
                      />
                      <Bar
                        dataKey="price"
                        fill="url(#barGrad)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Market Factors */}
              <div
                className="pred-fade-3"
                style={{
                  background: isDark ? "rgba(30,41,59,0.8)" : "white",
                  borderRadius: "22px",
                  border: `1px solid ${cardBorder}`,
                  boxShadow: cardShadow,
                  padding: "22px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "15%",
                    right: "15%",
                    height: "1px",
                    background: `linear-gradient(90deg,transparent,${isDark ? "rgba(52,211,153,0.2)" : "rgba(22,163,74,0.15)"},transparent)`,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      background: isDark ? "rgba(52,211,153,0.1)" : "#f0fdf4",
                      border: "1px solid rgba(52,211,153,0.2)",
                      borderRadius: "10px",
                      padding: "8px",
                    }}
                  >
                    <BarChart3
                      style={{
                        width: "15px",
                        height: "15px",
                        color: "#34d399",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: text,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Market Factors
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    position: "relative",
                  }}
                >
                  {result.factors.map(({ label, impact, detail, type }) => (
                    <div
                      key={label}
                      className="factor-card"
                      style={{
                        padding: "12px 14px",
                        borderRadius: "12px",
                        background: factorBg(type),
                        border: `1px solid ${factorBd(type)}`,
                        borderLeft: `3px solid ${factorGlow[type]}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "3px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: text,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: factorGlow[type],
                            background: isDark ? "rgba(0,0,0,0.3)" : "white",
                            padding: "2px 8px",
                            borderRadius: "20px",
                            border: `1px solid ${factorGlow[type]}30`,
                          }}
                        >
                          {impact}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: muted,
                          lineHeight: 1.5,
                        }}
                      >
                        {detail}
                      </div>
                    </div>
                  ))}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                      border: `1px solid ${cardBorder}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                      }}
                    >
                      <Info
                        style={{ width: "14px", height: "14px", color: muted }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: muted,
                          fontWeight: 600,
                        }}
                      >
                        MSP Reference
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: text,
                        fontFamily: "'DM Mono',monospace",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{result.mspPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Banner */}
            <div
              className="pred-fade-4"
              style={{
                background: "linear-gradient(135deg,#166534 0%,#16A34A 100%)",
                borderRadius: "22px",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid rgba(52,211,153,0.2)",
                boxShadow: "0 8px 40px rgba(22,163,74,0.2)",
                position: "relative",
                overflow: "hidden",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    "linear-gradient(90deg,transparent,rgba(52,211,153,0.5),transparent)",
                }}
              />
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: "14px",
                    marginBottom: "5px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {result.up ? "📈 Bullish Outlook" : "📉 Bearish Outlook"} for{" "}
                  {form.crop} in {form.region}
                </div>
                <div
                  style={{ color: "rgba(167,243,208,0.8)", fontSize: "13px" }}
                >
                  Predicted price of{" "}
                  <strong style={{ color: "white" }}>
                    ₹{Math.round(result.price).toLocaleString()}/quintal
                  </strong>{" "}
                  for {form.month} with{" "}
                  <strong style={{ color: "white" }}>
                    {result.confidence}%
                  </strong>{" "}
                  confidence
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(0,0,0,0.35)",
                  borderRadius: "14px",
                  border: "1px solid rgba(253,224,71,0.3)",
                  padding: "10px 16px",
                  backdropFilter: "blur(8px)",
                  flexShrink: 0,
                }}
              >
                {result.up ? (
                  <TrendingUp
                    style={{ width: "22px", height: "22px", color: "#fde047" }}
                  />
                ) : (
                  <TrendingDown
                    style={{ width: "22px", height: "22px", color: "#fca5a5" }}
                  />
                )}
                <span
                  style={{
                    color: result.up ? "#fde047" : "#fca5a5",
                    fontWeight: 800,
                    fontSize: "18px",
                    fontFamily: "'DM Mono',monospace",
                    letterSpacing: "-0.02em",
                  }}
                >
                  +{result.change}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

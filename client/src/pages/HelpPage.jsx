import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  MessageCircle,
  FileText,
  Globe,
  Star,
} from "lucide-react";

const FAQS = [
  {
    q: "How accurate are the price predictions?",
    a: "Our Random Forest model achieves 85–92% accuracy based on historical validation. Accuracy varies by crop and season — Rabi crops like Wheat tend to be more predictable than volatile vegetables like Tomato.",
  },
  {
    q: "How often is the model updated?",
    a: "The ML model is trained on historical mandi data from data.gov.in. You can retrain it anytime by running python train.py in the server directory from your terminal.",
  },
  {
    q: "Which states and crops are supported?",
    a: "9 crops: Wheat, Rice, Tomato, Onion, Cotton, Maize, Potato, Mustard, Soyabean across 9 states: Punjab, Haryana, Maharashtra, Gujarat, Rajasthan, Uttar Pradesh, Madhya Pradesh, Karnataka, Andhra Pradesh.",
  },
  {
    q: "What is a price alert?",
    a: "A price alert notifies you (via the bell icon) when a predicted crop price crosses your set threshold — above or below. Set them from the bell icon in the navbar under My Alerts.",
  },
  {
    q: "Why does Compare Crops not save predictions?",
    a: "The Compare page uses save=false on quick predictions to avoid cluttering your history with auto-loaded data. Only when you explicitly click Predict on the Predictions page is data saved to MongoDB.",
  },
  {
    q: "How do I export my prediction history?",
    a: "Go to the History page and click the Export CSV button. You can filter by crop, state, or status before exporting — the CSV reflects your current filter selection.",
  },
  {
    q: "What does the confidence score mean?",
    a: "Confidence (0–100%) reflects how consistent the model's predictions are across all decision trees in the Random Forest. Higher = more reliable.",
  },
  {
    q: "How do I change my password?",
    a: "Go to My Profile and scroll to the Change Password section. Enter your current password, then your new password twice. The change is applied immediately.",
  },
  {
    q: "Why does the greeting show my first name?",
    a: "AgriSense reads your name from the JWT token stored in your browser. If you update your name in My Profile, sign out and back in to refresh the greeting.",
  },
  {
    q: "Can I use AgriSense offline?",
    a: "The frontend can load, but predictions require the FastAPI backend to be running locally. MongoDB Atlas needs an internet connection to save and retrieve data.",
  },
];

const QUICK_LINKS = [
  {
    icon: FileText,
    title: "Crop Price Data",
    sub: "Live mandi prices — data.gov.in",
    color: "#34d399",
    action: () =>
      window.open(
        "https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi",
        "_blank",
      ),
  },
  {
    icon: Globe,
    title: "IMD Weather",
    sub: "India Meteorological Department",
    color: "#22d3ee",
    action: () => window.open("https://mausam.imd.gov.in", "_blank"),
  },
  {
    icon: Star,
    title: "Agmarknet",
    sub: "Agri market price portal",
    color: "#fbbf24",
    action: () => window.open("https://agmarknet.gov.in", "_blank"),
  },
  {
    icon: MessageCircle,
    title: "Kisan Call Centre",
    sub: "1800-180-1551 (free helpline)",
    color: "#f87171",
    action: () => window.open("tel:18001801551"),
  },
  {
    icon: Mail,
    title: "Email Support",
    sub: "support@agrisense.in",
    color: "#a78bfa",
    action: () => window.open("mailto:support@agrisense.in"),
  },
];

export default function HelpPage() {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(null);

  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const text = isDark ? "#e8edf8" : "#0f172a";
  const muted = isDark ? "#94a3b8" : "#4b5563";
  const cardShadow = isDark
    ? "0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
    : "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)";

  const Card = ({ children, style = {} }) => (
    <div
      style={{
        background: isDark ? "rgba(30,41,59,0.8)" : "white",
        borderRadius: "22px",
        border: `1px solid ${cardBorder}`,
        boxShadow: cardShadow,
        position: "relative",
        overflow: "hidden",
        ...style,
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
      {children}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .hp-fade-1 { animation: fadeUp 0.45s 0.00s ease both; }
        .hp-fade-2 { animation: fadeUp 0.45s 0.07s ease both; }
        .hp-fade-3 { animation: fadeUp 0.45s 0.14s ease both; }
        .faq-btn { transition: background 0.15s; }
        .faq-btn:hover { background: ${isDark ? "rgba(52,211,153,0.04)" : "#f0fdf4"} !important; }
        .link-btn { transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        .link-btn:hover { transform: translateX(3px); }
      `}</style>

      <div className="hp-fade-1">
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: text,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Help & Support
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: muted,
            marginTop: "4px",
            fontWeight: 400,
          }}
        >
          Everything you need to know about AgriSense
        </p>
      </div>

      {/* Hero */}
      <div
        className="hp-fade-2"
        style={{
          background: "linear-gradient(135deg,#166534 0%,#16A34A 100%)",
          borderRadius: "22px",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(52,211,153,0.2)",
          boxShadow: "0 8px 40px rgba(22,163,74,0.2)",
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
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(52,211,153,0.15) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <HelpCircle
              style={{ width: "26px", height: "26px", color: "white" }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              How can we help?
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.75)",
                marginTop: "4px",
              }}
            >
              Browse FAQs or use the quick links to access useful resources
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "28px",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {[
            ["10", "FAQs"],
            ["9", "Crops"],
            ["85%+", "Accuracy"],
          ].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "white",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {val}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.65)",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="hp-fade-3"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* FAQ accordion */}
        <Card style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 22px",
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              fontSize: "14px",
              fontWeight: 800,
              color: text,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              position: "relative",
            }}
          >
            📋 Frequently Asked Questions
            <span
              style={{
                background: isDark ? "rgba(52,211,153,0.1)" : "#dcfce7",
                color: "#34d399",
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "20px",
                border: "1px solid rgba(52,211,153,0.25)",
              }}
            >
              {FAQS.length}
            </span>
          </div>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                borderBottom:
                  i < FAQS.length - 1
                    ? `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}`
                    : "none",
              }}
            >
              <button
                className="faq-btn"
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "14px 22px",
                  background:
                    open === i
                      ? isDark
                        ? "rgba(52,211,153,0.05)"
                        : "#f0fdf4"
                      : "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: open === i ? 700 : 600,
                    color: open === i ? "#34d399" : text,
                    lineHeight: "1.4",
                  }}
                >
                  {faq.q}
                </span>
                {open === i ? (
                  <ChevronUp
                    style={{
                      width: "15px",
                      height: "15px",
                      color: "#34d399",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <ChevronDown
                    style={{
                      width: "15px",
                      height: "15px",
                      color: muted,
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
              {open === i && (
                <div
                  style={{
                    padding: "0 22px 16px",
                    fontSize: "13px",
                    color: muted,
                    lineHeight: "1.7",
                    background: isDark ? "rgba(52,211,153,0.03)" : "#f8fafc",
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </Card>

        {/* Quick links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: text,
              marginBottom: "4px",
              letterSpacing: "-0.01em",
            }}
          >
            🔗 Useful Resources
          </div>
          {QUICK_LINKS.map(({ icon: Icon, title, sub, color, action }) => (
            <button
              key={title}
              className="link-btn"
              onClick={action}
              style={{
                background: isDark ? "rgba(30,41,59,0.8)" : "white",
                border: `1px solid ${cardBorder}`,
                borderRadius: "16px",
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textAlign: "left",
                width: "100%",
                boxShadow: cardShadow,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color + "50";
                e.currentTarget.style.boxShadow = `0 0 20px ${color}12`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = cardBorder;
                e.currentTarget.style.boxShadow = cardShadow;
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "11px",
                  background: `${color}15`,
                  border: `1px solid ${color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: "16px", height: "16px", color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: text }}>
                  {title}
                </div>
                <div
                  style={{ fontSize: "11px", color: muted, marginTop: "1px" }}
                >
                  {sub}
                </div>
              </div>
              <ExternalLink
                style={{
                  width: "13px",
                  height: "13px",
                  color: muted,
                  flexShrink: 0,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Phone,
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
    color: "#16a34a",
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
    color: "#0ea5e9",
    action: () => window.open("https://mausam.imd.gov.in", "_blank"),
  },
  {
    icon: Star,
    title: "Agmarknet",
    sub: "Agri market price portal",
    color: "#f59e0b",
    action: () => window.open("https://agmarknet.gov.in", "_blank"),
  },
  {
    icon: MessageCircle,
    title: "Kisan Call Centre",
    sub: "1800-180-1551 (free helpline)",
    color: "#ec4899",
    action: () => window.open("tel:18001801551"),
  },
  {
    icon: Mail,
    title: "Email Support",
    sub: "support@agrisense.in",
    color: "#6366f1",
    action: () => window.open("mailto:support@agrisense.in"),
  },
];

export default function HelpPage() {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(null);

  const card = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e5e7eb";
  const text = isDark ? "#f1f5f9" : "#1f2937";
  const muted = isDark ? "#94a3b8" : "#6b7280";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1
          style={{ fontSize: "22px", fontWeight: 700, color: text, margin: 0 }}
        >
          Help & Support
        </h1>
        <p style={{ fontSize: "13px", color: muted, marginTop: "4px" }}>
          Everything you need to know about AgriSense
        </p>
      </div>

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg,#15803d,#16a34a)",
          borderRadius: "16px",
          padding: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "14px",
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
            <div style={{ fontSize: "18px", fontWeight: 800, color: "white" }}>
              How can we help?
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.8)",
                marginTop: "4px",
              }}
            >
              Browse FAQs or use the quick links to access useful resources
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", flexShrink: 0 }}>
          {[
            ["10", "FAQs"],
            ["9", "Crops"],
            ["85%+", "Accuracy"],
          ].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: "20px", fontWeight: 800, color: "white" }}
              >
                {val}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* FAQ accordion */}
        <div
          style={{
            background: card,
            borderRadius: "16px",
            border: `1px solid ${border}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${border}`,
              fontSize: "13px",
              fontWeight: 700,
              color: text,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📋 Frequently Asked Questions
            <span
              style={{
                background: isDark ? "#334155" : "#f3f4f6",
                color: muted,
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "20px",
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
                  i < FAQS.length - 1 ? `1px solid ${border}` : "none",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  background:
                    open === i
                      ? isDark
                        ? "rgba(22,163,74,0.05)"
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
                    fontWeight: 600,
                    color: open === i ? "#16a34a" : text,
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
                      color: "#16a34a",
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
                    padding: "0 20px 16px",
                    fontSize: "13px",
                    color: muted,
                    lineHeight: "1.7",
                    background: isDark ? "rgba(22,163,74,0.04)" : "#f0fdf4",
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: text,
              marginBottom: "4px",
            }}
          >
            🔗 Useful Resources
          </div>
          {QUICK_LINKS.map(({ icon: Icon, title, sub, color, action }) => (
            <button
              key={title}
              onClick={action}
              style={{
                background: card,
                border: `1px solid ${border}`,
                borderRadius: "12px",
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.background = isDark
                  ? `${color}12`
                  : `${color}08`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = border;
                e.currentTarget.style.background = card;
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  background: `${color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: "16px", height: "16px", color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: text }}>
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

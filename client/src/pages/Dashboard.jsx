import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  BarChart3,
  Zap,
  Sprout,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const priceData = [
  { month: "Oct", wheat: 2100, rice: 3200, tomato: 1800 },
  { month: "Nov", wheat: 2300, rice: 3100, tomato: 2200 },
  { month: "Dec", wheat: 2200, rice: 3400, tomato: 1600 },
  { month: "Jan", wheat: 2500, rice: 3300, tomato: 2800 },
  { month: "Feb", wheat: 2400, rice: 3600, tomato: 3200 },
  { month: "Mar", wheat: 2800, rice: 3500, tomato: 2900 },
];

const metricCards = [
  {
    title: "Predicted Price",
    value: "₹2,847",
    sub: "Wheat · Next Week",
    icon: IndianRupee,
    trend: "+12.4%",
    up: true,
    bg: "#F0FDF4",
    border: "#BBF7D0",
    iconBg: "#16A34A",
  },
  {
    title: "Confidence Score",
    value: "87.3%",
    sub: "Model Accuracy",
    icon: BarChart3,
    trend: "+2.1%",
    up: true,
    bg: "#EFF6FF",
    border: "#BFDBFE",
    iconBg: "#2563EB",
  },
  {
    title: "Price Trend",
    value: "Rising",
    sub: "Tomato · Maharashtra",
    icon: TrendingUp,
    trend: "+8.7%",
    up: true,
    bg: "#FFF7ED",
    border: "#FED7AA",
    iconBg: "#EA580C",
  },
];

const recentPredictions = [
  {
    crop: "Wheat",
    region: "Punjab",
    price: "₹2,847",
    change: "+12%",
    up: true,
  },
  { crop: "Rice", region: "Haryana", price: "₹3,520", change: "+5%", up: true },
  {
    crop: "Tomato",
    region: "Maharashtra",
    price: "₹2,900",
    change: "-3%",
    up: false,
  },
  {
    crop: "Onion",
    region: "Nashik",
    price: "₹1,650",
    change: "+18%",
    up: true,
  },
  {
    crop: "Cotton",
    region: "Gujarat",
    price: "₹6,200",
    change: "-7%",
    up: false,
  },
];

const topCrops = [
  {
    name: "Wheat",
    price: "₹2,847",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&q=80&auto=format&fit=crop",
  },
  {
    name: "Rice",
    price: "₹3,520",
    image:
      "https://images.unsplash.com/photo-1723475158232-819e29803f4d?w=300&q=80&auto=format&fit=crop",
  },
  {
    name: "Tomato",
    price: "₹2,900",
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&q=80&auto=format&fit=crop",
  },
  {
    name: "Onion",
    price: "₹1,650",
    image:
      "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=300&q=80&auto=format&fit=crop",
  },
];

const crops = [
  "Wheat",
  "Rice",
  "Tomato",
  "Onion",
  "Cotton",
  "Maize",
  "Soybean",
];
const regions = [
  "Punjab",
  "Haryana",
  "Maharashtra",
  "Gujarat",
  "Nashik",
  "UP",
  "MP",
];

const S = {
  inputH: { height: "36px" },
  select: {
    height: "36px",
    borderRadius: "10px",
    padding: "0 10px",
    fontSize: "13px",
    color: "#374151",
    background: "white",
    border: "none",
    outline: "none",
    width: "100%",
  },
  predictBtn: {
    height: "36px",
    padding: "0 18px",
    borderRadius: "10px",
    background: "#facc15",
    fontWeight: 700,
    fontSize: "13px",
    color: "#1f2937",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  predictBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
};

export default function Dashboard() {
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    if (!selectedCrop || !selectedRegion) return;
    setLoading(true);
    setPrediction(null);
    setTimeout(() => {
      const base = Math.floor(Math.random() * 3000) + 1500;
      const confidence = Math.floor(Math.random() * 20) + 78;
      const change = (Math.random() * 20 - 5).toFixed(1);
      setPrediction({
        price: `₹${base.toLocaleString()}`,
        confidence: `${confidence}%`,
        change: `${parseFloat(change) > 0 ? "+" : ""}${change}%`,
        up: parseFloat(change) > 0,
      });
      setLoading(false);
    }, 1500);
  };

  const disabled = !selectedCrop || !selectedRegion || loading;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "20px",
        }}
      >
        {metricCards.map(
          ({
            title,
            value,
            sub,
            icon: Icon,
            trend,
            up,
            bg,
            border,
            iconBg,
          }) => (
            <div
              key={title}
              style={{
                backgroundColor: bg,
                border: `1px solid ${border}`,
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    {title}
                  </p>
                  <h3
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#1f2937",
                      margin: "4px 0",
                    }}
                  >
                    {value}
                  </h3>
                  <p style={{ fontSize: "11px", color: "#9ca3af" }}>{sub}</p>
                </div>
                <div
                  style={{
                    backgroundColor: iconBg,
                    borderRadius: "10px",
                    padding: "10px",
                  }}
                >
                  <Icon
                    style={{ width: "18px", height: "18px", color: "white" }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginTop: "12px",
                }}
              >
                {up ? (
                  <TrendingUp
                    style={{ width: "14px", height: "14px", color: "#22c55e" }}
                  />
                ) : (
                  <TrendingDown
                    style={{ width: "14px", height: "14px", color: "#ef4444" }}
                  />
                )}
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: up ? "#16a34a" : "#ef4444",
                  }}
                >
                  {trend}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    marginLeft: "2px",
                  }}
                >
                  vs last week
                </span>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Main Grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}
      >
        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quick Predict */}
          <div
            style={{
              background: "linear-gradient(135deg, #166534 0%, #16A34A 100%)",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Zap
                style={{ width: "18px", height: "18px", color: "#fde047" }}
              />
              <span
                style={{ color: "white", fontWeight: 700, fontSize: "15px" }}
              >
                Quick Predict
              </span>
              <span style={{ color: "#bbf7d0", fontSize: "12px" }}>
                Get instant price prediction
              </span>
            </div>

            {/* ROW — all same height via inline styles */}
            <div
              style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}
            >
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    color: "#bbf7d0",
                    fontSize: "11px",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Crop
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  style={S.select}
                >
                  <option value="">Select crop...</option>
                  {crops.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    color: "#bbf7d0",
                    fontSize: "11px",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  style={S.select}
                >
                  <option value="">Select region...</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handlePredict}
                disabled={disabled}
                style={{
                  ...S.predictBtn,
                  ...(disabled ? S.predictBtnDisabled : {}),
                }}
              >
                {loading ? "⏳" : "Predict →"}
              </button>

              {prediction && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "rgba(255,255,255,0.18)",
                    borderRadius: "10px",
                    padding: "0 14px",
                    height: "36px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#bbf7d0", fontSize: "10px" }}>
                      Price
                    </div>
                    <div
                      style={{
                        color: "white",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      {prediction.price}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "1px",
                      height: "18px",
                      background: "rgba(255,255,255,0.25)",
                    }}
                  />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#bbf7d0", fontSize: "10px" }}>
                      Confidence
                    </div>
                    <div
                      style={{
                        color: "white",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      {prediction.confidence}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "1px",
                      height: "18px",
                      background: "rgba(255,255,255,0.25)",
                    }}
                  />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#bbf7d0", fontSize: "10px" }}>
                      Change
                    </div>
                    <div
                      style={{
                        color: prediction.up ? "#fde047" : "#fca5a5",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      {prediction.change}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chart — fixed height, chart fills 100% of remaining space */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #f3f4f6",
              boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
              padding: "20px 20px 12px 20px",
              height: "320px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px",
                flexShrink: 0,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  Price Trends
                </div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                  Last 6 months · ₹ per quintal
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["1M", "3M", "6M", "1Y"].map((p) => (
                  <button
                    key={p}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 500,
                      border: "none",
                      cursor: "pointer",
                      background: p === "6M" ? "#16a34a" : "#f3f4f6",
                      color: p === "6M" ? "white" : "#6b7280",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {/* This div fills all remaining space — no gap possible */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #E5E7EB",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="wheat"
                    stroke="#16A34A"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Wheat"
                  />
                  <Line
                    type="monotone"
                    dataKey="rice"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Rice"
                  />
                  <Line
                    type="monotone"
                    dataKey="tomato"
                    stroke="#EA580C"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Tomato"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Recent Predictions */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #f3f4f6",
              boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
              padding: "20px",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <span
                style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}
              >
                Recent Predictions
              </span>
              <button
                style={{
                  fontSize: "12px",
                  color: "#16a34a",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                View all
              </button>
            </div>
            {recentPredictions.map(({ crop, region, price, change, up }) => (
              <div
                key={crop}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #f9fafb",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "#f0fdf4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sprout
                      style={{
                        width: "14px",
                        height: "14px",
                        color: "#16a34a",
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      {crop}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {region}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#1f2937",
                    }}
                  >
                    {price}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: up ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Crops */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #f3f4f6",
              boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <span
                style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}
              >
                Top Crops Today
              </span>
              <Sprout
                style={{ width: "16px", height: "16px", color: "#22c55e" }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {topCrops.map(({ name, price, image }) => (
                <div
                  key={name}
                  style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    position: "relative",
                    height: "88px",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={image}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.style.backgroundColor = "#f0fdf4";
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "8px",
                    }}
                  >
                    <div
                      style={{
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {name}
                    </div>
                    <div
                      style={{
                        color: "#86efac",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

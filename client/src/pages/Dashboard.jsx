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

// Using picsum with specific seeds for consistent crop-like images
const topCrops = [
  {
    name: "Wheat",
    price: "₹2,847",
    region: "Punjab",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&q=80&auto=format&fit=crop",
  },
  {
    name: "Rice",
    price: "₹3,520",
    region: "Haryana",
    image:
      "https://images.unsplash.com/photo-1723475158232-819e29803f4d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Tomato",
    price: "₹2,900",
    region: "Maharashtra",
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&q=80&auto=format&fit=crop",
  },
  {
    name: "Onion",
    price: "₹1,650",
    region: "Nashik",
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
        change: `${change > 0 ? "+" : ""}${change}%`,
        up: parseFloat(change) > 0,
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-5">
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
              className="rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: bg, border: `1px solid ${border}` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{title}</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {value}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{sub}</p>
                </div>
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: iconBg }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {up ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-semibold ${up ? "text-green-600" : "text-red-500"}`}
                >
                  {trend}
                </span>
                <span className="text-xs text-gray-400 ml-1">vs last week</span>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left col */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* Quick Predict Widget */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #166534 0%, #16A34A 100%)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-300" />
              <h3 className="text-white font-bold text-base">Quick Predict</h3>
              <span className="text-green-200 text-xs ml-1">
                Get instant price prediction
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Crop */}
              <div className="flex-1 min-w-[120px]">
                <label className="text-green-200 text-xs font-medium mb-1 block">
                  Crop
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm text-gray-700 bg-white outline-none"
                >
                  <option value="">Select crop...</option>
                  {crops.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div className="flex-1 min-w-[120px]">
                <label className="text-green-200 text-xs font-medium mb-1 block">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm text-gray-700 bg-white outline-none"
                >
                  <option value="">Select region...</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Button */}
              <button
                onClick={handlePredict}
                disabled={!selectedCrop || !selectedRegion || loading}
                className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? "⏳" : "Predict →"}
              </button>

              {/* Compact Result */}
              {prediction && (
                <div className="flex items-center gap-3 bg-white bg-opacity-20 rounded-xl px-4 py-2 mt-4">
                  <div className="text-center">
                    <p className="text-green-200 text-xs">Price</p>
                    <p className="text-white font-bold text-sm">
                      {prediction.price}
                    </p>
                  </div>
                  <div className="w-px h-6 bg-green-400 opacity-40" />
                  <div className="text-center">
                    <p className="text-green-200 text-xs">Confidence</p>
                    <p className="text-white font-bold text-sm">
                      {prediction.confidence}
                    </p>
                  </div>
                  <div className="w-px h-6 bg-green-400 opacity-40" />
                  <div className="text-center">
                    <p className="text-green-200 text-xs">Change</p>
                    <p
                      className={`font-bold text-sm ${prediction.up ? "text-yellow-300" : "text-red-300"}`}
                    >
                      {prediction.change}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Trend Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  Price Trends
                </h3>
                <p className="text-xs text-gray-400">
                  Last 6 months · ₹ per quintal
                </p>
              </div>
              <div className="flex items-center gap-2">
                {["1M", "3M", "6M", "1Y"].map((period) => (
                  <button
                    key={period}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                      ${period === "6M" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-green-50"}`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="wheat"
                  stroke="#16A34A"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Wheat"
                />
                <Line
                  type="monotone"
                  dataKey="rice"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Rice"
                />
                <Line
                  type="monotone"
                  dataKey="tomato"
                  stroke="#EA580C"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Tomato"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-5">
          {/* Recent Predictions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">
                Recent Predictions
              </h3>
              <button className="text-xs text-green-600 font-medium hover:underline">
                View all
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {recentPredictions.map(({ crop, region, price, change, up }) => (
                <div
                  key={crop}
                  className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                      <Sprout className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {crop}
                      </p>
                      <p className="text-xs text-gray-400">{region}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{price}</p>
                    <p
                      className={`text-xs font-semibold ${up ? "text-green-500" : "text-red-500"}`}
                    >
                      {change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Crops with Images */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">
                Top Crops Today
              </h3>
              <Sprout className="w-4 h-4 text-green-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {topCrops.map(({ name, price, image }) => (
                <div
                  key={name}
                  className="rounded-xl overflow-hidden relative group cursor-pointer"
                  style={{ height: "90px" }}
                >
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.style.backgroundColor = "#F0FDF4";
                    }}
                  />
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-2"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                    }}
                  >
                    <p className="text-white text-xs font-bold">{name}</p>
                    <p className="text-green-300 text-xs font-semibold">
                      {price}
                    </p>
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

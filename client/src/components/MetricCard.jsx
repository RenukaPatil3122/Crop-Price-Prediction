import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricCard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  up,
  bg,
  border,
  iconBg,
}) {
  return (
    <div
      style={{
        backgroundColor: bg || "#F0FDF4",
        border: `1px solid ${border || "#BBF7D0"}`,
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
          <p style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>
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
        {Icon && (
          <div
            style={{
              backgroundColor: iconBg || "#16A34A",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <Icon style={{ width: "18px", height: "18px", color: "white" }} />
          </div>
        )}
      </div>

      {trend && (
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
            style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "2px" }}
          >
            vs last week
          </span>
        </div>
      )}
    </div>
  );
}

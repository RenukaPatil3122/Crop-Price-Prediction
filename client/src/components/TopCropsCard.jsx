import { Sprout, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

// High quality Unsplash crop images
const CROP_IMAGES = {
  Wheat:
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=85&auto=format&fit=crop",
  Rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=85&auto=format&fit=crop",
  Tomato:
    "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=85&auto=format&fit=crop",
  Onion:
    "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400&q=85&auto=format&fit=crop",
  Cotton:
    "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400&q=85&auto=format&fit=crop",
  Maize:
    "https://images.unsplash.com/photo-1601593346740-925612772716?w=400&q=85&auto=format&fit=crop",
  Potato:
    "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&q=85&auto=format&fit=crop",
  Mustard:
    "https://images.unsplash.com/photo-1599909631520-4a1b09a78afe?w=400&q=85&auto=format&fit=crop",
  Soyabean:
    "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400&q=85&auto=format&fit=crop",
};

const CROP_FALLBACK_COLORS = {
  Wheat: "#d97706",
  Rice: "#6b7280",
  Tomato: "#dc2626",
  Onion: "#7c3aed",
  Cotton: "#0891b2",
  Maize: "#ca8a04",
  Potato: "#92400e",
  Mustard: "#65a30d",
  Soyabean: "#16a34a",
};

export function CropImageCard({ name, price, change, up }) {
  const [imgError, setImgError] = useState(false);
  const fallbackColor = CROP_FALLBACK_COLORS[name] || "#166534";

  return (
    <div
      style={{
        borderRadius: "14px",
        overflow: "hidden",
        position: "relative",
        height: "96px",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
      }}
    >
      {/* Image or fallback */}
      {!imgError && CROP_IMAGES[name] ? (
        <img
          src={CROP_IMAGES[name]}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: fallbackColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sprout
            style={{
              width: "28px",
              height: "28px",
              color: "rgba(255,255,255,0.6)",
            }}
          />
        </div>
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "8px 10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                color: "white",
                fontSize: "12px",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {name}
            </div>
            <div
              style={{ color: "#86efac", fontSize: "12px", fontWeight: 700 }}
            >
              {price}
            </div>
          </div>
          {change && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                background: up
                  ? "rgba(22,163,74,0.85)"
                  : "rgba(220,38,38,0.85)",
                borderRadius: "6px",
                padding: "2px 6px",
              }}
            >
              {up ? (
                <TrendingUp
                  style={{ width: "9px", height: "9px", color: "white" }}
                />
              ) : (
                <TrendingDown
                  style={{ width: "9px", height: "9px", color: "white" }}
                />
              )}
              <span
                style={{ fontSize: "10px", color: "white", fontWeight: 700 }}
              >
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TopCropsCard({ crops }) {
  return (
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
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}>
          Top Crops Today
        </span>
        <Sprout style={{ width: "16px", height: "16px", color: "#22c55e" }} />
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
      >
        {crops.map(({ name, price, change, up }) => (
          <CropImageCard
            key={name}
            name={name}
            price={price}
            change={change}
            up={up}
          />
        ))}
      </div>
    </div>
  );
}

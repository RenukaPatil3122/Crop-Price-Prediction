import { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Eye,
  Thermometer,
} from "lucide-react";

// Free OpenWeatherMap API - get key at openweathermap.org (free tier)
// Defaulting to New Delhi if no location found
const API_KEY = "REDACTED"; // free demo key
const DEFAULT_CITY = "New Delhi";

const weatherIcons = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudRain,
  Snow: CloudSnow,
  Thunderstorm: CloudRain,
  Mist: Cloud,
  Fog: Cloud,
  Haze: Cloud,
};

const weatherColors = {
  Clear: {
    bg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    icon: "#f59e0b",
  },
  Clouds: {
    bg: "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
    icon: "#9ca3af",
  },
  Rain: {
    bg: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    icon: "#60a5fa",
  },
  Drizzle: {
    bg: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
    icon: "#22d3ee",
  },
  Snow: {
    bg: "linear-gradient(135deg, #bfdbfe 0%, #e0f2fe 100%)",
    icon: "#93c5fd",
  },
  Thunderstorm: {
    bg: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)",
    icon: "#a5b4fc",
  },
  default: {
    bg: "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
    icon: "#86efac",
  },
};

// Agri advice based on weather
const getAgriTip = (weather, temp) => {
  if (weather === "Rain" || weather === "Drizzle")
    return "💧 Good irrigation day — skip watering";
  if (weather === "Clear" && temp > 35)
    return "☀️ High heat — protect vegetable crops";
  if (weather === "Clear" && temp < 15)
    return "❄️ Cold night — cover sensitive crops";
  if (weather === "Thunderstorm") return "⚡ Avoid field work today";
  if (weather === "Clouds") return "🌥️ Good day for pesticide spraying";
  return "🌾 Favorable conditions for fieldwork";
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(DEFAULT_CITY);

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeatherByCity(DEFAULT_CITY),
      );
    } else {
      fetchWeatherByCity(DEFAULT_CITY);
    }
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
      );
      const data = await res.json();
      if (data.cod === 200) {
        setWeather(data);
        setCity(data.name);
      } else {
        fetchWeatherByCity(DEFAULT_CITY);
      }
    } catch {
      fetchWeatherByCity(DEFAULT_CITY);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (cityName) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`,
      );
      const data = await res.json();
      if (data.cod === 200) {
        setWeather(data);
        setCity(data.name);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          margin: "12px 16px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.4)",
          padding: "14px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "11px", color: "#166534", opacity: 0.7 }}>
          Loading weather...
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const main = weather.weather[0].main;
  const desc = weather.weather[0].description;
  const temp = Math.round(weather.main.temp);
  const feelsLike = Math.round(weather.main.feels_like);
  const humidity = weather.main.humidity;
  const windSpeed = Math.round(weather.wind.speed * 3.6); // m/s to km/h
  const visibility = weather.visibility
    ? Math.round(weather.visibility / 1000)
    : null;

  const colors = weatherColors[main] || weatherColors.default;
  const WeatherIcon = weatherIcons[main] || Cloud;
  const tip = getAgriTip(main, temp);

  return (
    <div style={{ margin: "0 12px 12px 12px" }}>
      <div
        style={{
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      >
        {/* Main weather block */}
        <div style={{ background: colors.bg, padding: "14px 16px 10px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {city}
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.1,
                  marginTop: "2px",
                }}
              >
                {temp != null ? `${temp}°C` : "--°C"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.8)",
                  marginTop: "2px",
                  textTransform: "capitalize",
                }}
              >
                {desc}
              </div>
            </div>
            <WeatherIcon
              style={{
                width: "36px",
                height: "36px",
                color: "rgba(255,255,255,0.9)",
              }}
            />
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <Droplets
                style={{
                  width: "11px",
                  height: "11px",
                  color: "rgba(255,255,255,0.75)",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 600,
                }}
              >
                {humidity}%
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <Wind
                style={{
                  width: "11px",
                  height: "11px",
                  color: "rgba(255,255,255,0.75)",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 600,
                }}
              >
                {windSpeed} km/h
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <Thermometer
                style={{
                  width: "11px",
                  height: "11px",
                  color: "rgba(255,255,255,0.75)",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 600,
                }}
              >
                Feels {feelsLike}°
              </span>
            </div>
          </div>
        </div>

        {/* Agri tip */}
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            padding: "8px 14px",
            borderTop: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#166534",
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {tip}
          </div>
        </div>
      </div>
    </div>
  );
}

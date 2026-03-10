import { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  AlertCircle,
} from "lucide-react";

// Uses Open-Meteo (100% free, no API key ever needed) + ip-api for location
// Falls back to Aurangabad/Ambad area if geolocation denied

const WMO_MAP = {
  0: {
    label: "Clear sky",
    icon: Sun,
    gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)",
  },
  1: {
    label: "Mainly clear",
    icon: Sun,
    gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)",
  },
  2: {
    label: "Partly cloudy",
    icon: Cloud,
    gradient: "linear-gradient(135deg,#6b7280,#9ca3af)",
  },
  3: {
    label: "Overcast",
    icon: Cloud,
    gradient: "linear-gradient(135deg,#475569,#64748b)",
  },
  45: {
    label: "Foggy",
    icon: Cloud,
    gradient: "linear-gradient(135deg,#475569,#64748b)",
  },
  48: {
    label: "Freezing fog",
    icon: Cloud,
    gradient: "linear-gradient(135deg,#475569,#64748b)",
  },
  51: {
    label: "Light drizzle",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#0891b2,#22d3ee)",
  },
  53: {
    label: "Drizzle",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#0891b2,#22d3ee)",
  },
  61: {
    label: "Light rain",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#2563eb,#3b82f6)",
  },
  63: {
    label: "Rain",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#1d4ed8,#2563eb)",
  },
  71: {
    label: "Light snow",
    icon: CloudSnow,
    gradient: "linear-gradient(135deg,#bfdbfe,#e0f2fe)",
  },
  80: {
    label: "Rain showers",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#2563eb,#3b82f6)",
  },
  95: {
    label: "Thunderstorm",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#1e1b4b,#3730a3)",
  },
};

const getWMO = (code) =>
  WMO_MAP[code] || {
    label: "Cloudy",
    icon: Cloud,
    gradient: "linear-gradient(135deg,#166534,#16a34a)",
  };

const getAgriTip = (code, temp) => {
  if ([61, 63, 80].includes(code))
    return "💧 Good irrigation day — skip watering";
  if ([95].includes(code)) return "⚡ Avoid field work today";
  if ([0, 1].includes(code) && temp > 35)
    return "☀️ High heat — protect vegetable crops";
  if ([0, 1].includes(code) && temp < 15)
    return "❄️ Cold night — cover sensitive crops";
  if ([2, 3].includes(code)) return "🌥️ Good day for pesticide spraying";
  if ([51, 53].includes(code)) return "🌧️ Light drizzle — monitor drainage";
  return "🌾 Favorable conditions for fieldwork";
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, null),
        () => fetchByIP(),
      );
    } else {
      fetchByIP();
    }
  }, []);

  const fetchByIP = async () => {
    try {
      const res = await fetch("http://ip-api.com/json/?fields=lat,lon,city");
      const data = await res.json();
      if (data.lat) {
        fetchWeather(data.lat, data.lon, data.city);
      } else {
        fetchWeather(19.9, 75.3, "Aurangabad"); // Ambad area fallback
      }
    } catch {
      fetchWeather(19.9, 75.3, "Aurangabad");
    }
  };

  const fetchWeather = async (lat, lon, cityName) => {
    try {
      // Reverse geocode for city name if we have coords but no city
      let resolvedCity = cityName;
      if (!resolvedCity) {
        try {
          const geo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          );
          const gd = await geo.json();
          resolvedCity =
            gd.address?.city ||
            gd.address?.town ||
            gd.address?.village ||
            gd.address?.county ||
            "Your Location";
        } catch {
          resolvedCity = "Your Location";
        }
      }
      setCity(resolvedCity);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.current) {
        setWeather(data.current);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          margin: "0 12px 12px",
          borderRadius: "14px",
          background: "rgba(22,163,74,0.1)",
          padding: "14px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "11px", color: "#86efac" }}>
          Loading weather…
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div
        style={{
          margin: "0 12px 12px",
          borderRadius: "14px",
          background: "rgba(100,116,139,0.15)",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <AlertCircle
          style={{
            width: "14px",
            height: "14px",
            color: "#94a3b8",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
          Weather unavailable
        </span>
      </div>
    );
  }

  const code = weather.weather_code;
  const temp = Math.round(weather.temperature_2m);
  const feels = Math.round(weather.apparent_temperature);
  const humidity = weather.relative_humidity_2m;
  const wind = Math.round(weather.wind_speed_10m);
  const wmo = getWMO(code);
  const WeatherIcon = wmo.icon;
  const tip = getAgriTip(code, temp);

  return (
    <div style={{ margin: "0 12px 12px 12px" }}>
      <div
        style={{
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ background: wmo.gradient, padding: "14px 16px 10px" }}>
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
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginBottom: "2px",
                }}
              >
                <MapPin
                  style={{
                    width: "10px",
                    height: "10px",
                    color: "rgba(255,255,255,0.75)",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {city}
                </span>
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.1,
                }}
              >
                {temp}°C
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.8)",
                  marginTop: "2px",
                }}
              >
                {wmo.label}
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
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            {[
              { Icon: Droplets, val: `${humidity}%` },
              { Icon: Wind, val: `${wind} km/h` },
              { Icon: Thermometer, val: `Feels ${feels}°` },
            ].map(({ Icon, val }) => (
              <div
                key={val}
                style={{ display: "flex", alignItems: "center", gap: "3px" }}
              >
                <Icon
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
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.25)", padding: "8px 14px" }}>
          <div
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.85)",
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

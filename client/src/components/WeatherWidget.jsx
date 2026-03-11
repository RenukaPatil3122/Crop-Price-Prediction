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

const WMO_MAP = {
  0: {
    label: "Clear sky",
    icon: Sun,
    gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)",
  },
  1: {
    label: "Mainly clear",
    icon: Sun,
    gradient: "linear-gradient(135deg,#f59e0b,#f97316)",
  },
  2: {
    label: "Partly cloudy",
    icon: Cloud,
    gradient: "linear-gradient(135deg,#4b6cb7,#6b7280)",
  },
  3: {
    label: "Overcast",
    icon: Cloud,
    gradient: "linear-gradient(135deg,#374151,#4b5563)",
  },
  45: {
    label: "Foggy",
    icon: Cloud,
    gradient: "linear-gradient(135deg,#374151,#4b5563)",
  },
  48: {
    label: "Freezing fog",
    icon: Cloud,
    gradient: "linear-gradient(135deg,#374151,#4b5563)",
  },
  51: {
    label: "Light drizzle",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#0891b2,#0ea5e9)",
  },
  53: {
    label: "Drizzle",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#0891b2,#0ea5e9)",
  },
  61: {
    label: "Light rain",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
  },
  63: {
    label: "Rain",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#1e3a8a,#1d4ed8)",
  },
  71: {
    label: "Light snow",
    icon: CloudSnow,
    gradient: "linear-gradient(135deg,#7dd3fc,#bfdbfe)",
  },
  80: {
    label: "Rain showers",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
  },
  95: {
    label: "Thunderstorm",
    icon: CloudRain,
    gradient: "linear-gradient(135deg,#1e1b4b,#4c1d95)",
  },
};

const getWMO = (code) =>
  WMO_MAP[code] || {
    label: "Cloudy",
    icon: Cloud,
    gradient: "linear-gradient(135deg,#166534,#16a34a)",
  };

const getAgriTip = (code, temp) => {
  if ([61, 63, 80].includes(code)) return "💧 Skip watering — good rain today";
  if ([95].includes(code)) return "⚡ Avoid field work today";
  if ([0, 1].includes(code) && temp > 35)
    return "🥵 High heat — protect vegetable crops";
  if ([0, 1].includes(code) && temp < 15)
    return "🧊 Cold night — cover sensitive crops";
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
      fetchWeather(
        data.lat || 19.9,
        data.lon || 75.3,
        data.city || "Aurangabad",
      );
    } catch {
      fetchWeather(19.9, 75.3, "Aurangabad");
    }
  };

  const fetchWeather = async (lat, lon, cityName) => {
    try {
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
            "Your Location";
        } catch {
          resolvedCity = "Your Location";
        }
      }
      setCity(resolvedCity);
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`,
      );
      const data = await res.json();
      data.current ? setWeather(data.current) : setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          margin: "0 12px 12px",
          borderRadius: "14px",
          background: "rgba(22,163,74,0.08)",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "11px", color: "#86efac", fontWeight: 600 }}>
          Loading weather…
        </div>
      </div>
    );

  if (error || !weather)
    return (
      <div
        style={{
          margin: "0 12px 12px",
          borderRadius: "14px",
          background: "rgba(100,116,139,0.1)",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <AlertCircle
          style={{ width: "14px", height: "14px", color: "#94a3b8" }}
        />
        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
          Weather unavailable
        </span>
      </div>
    );

  const code = weather.weather_code;
  const temp = Math.round(weather.temperature_2m);
  const feels = Math.round(weather.apparent_temperature);
  const humidity = weather.relative_humidity_2m;
  const wind = Math.round(weather.wind_speed_10m);
  const wmo = getWMO(code);
  const WeatherIcon = wmo.icon;
  const tip = getAgriTip(code, temp);

  return (
    <div style={{ margin: "0 12px 12px" }}>
      <div
        style={{
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
        }}
      >
        {/* Gradient top */}
        <div style={{ background: wmo.gradient, padding: "14px 16px 10px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              {/* City */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginBottom: "4px",
                }}
              >
                <MapPin
                  style={{
                    width: "10px",
                    height: "10px",
                    color: "rgba(255,255,255,0.85)",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    color: "#ffffff",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {city}
                </span>
              </div>
              {/* Temp */}
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.1,
                }}
              >
                {temp}°C
              </div>
              {/* Description */}
              <div
                style={{
                  fontSize: "11px",
                  color: "#ffffff",
                  marginTop: "3px",
                  fontWeight: 600,
                }}
              >
                {wmo.label}
              </div>
            </div>
            <WeatherIcon
              style={{
                width: "36px",
                height: "36px",
                color: "rgba(255,255,255,0.95)",
              }}
            />
          </div>

          {/* Meta row — pure white, bold */}
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
                    color: "rgba(255,255,255,0.85)",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    color: "#ffffff",
                    fontWeight: 700,
                  }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Agri tip strip */}
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            padding: "9px 14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#166534",
              fontWeight: 700,
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

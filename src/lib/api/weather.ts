import type { WeatherData, WeatherCurrent } from "@/types";

const WEATHER_API = "https://api.open-meteo.com/v1";

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Icy fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  80: { label: "Showers", icon: "🌦️" },
  81: { label: "Showers", icon: "🌦️" },
  82: { label: "Heavy showers", icon: "⛈️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Heavy snow showers", icon: "❄️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm with hail", icon: "⛈️" },
  99: { label: "Thunderstorm with heavy hail", icon: "⛈️" },
};

export function getWeatherIcon(code: number): string {
  return WMO_CODES[code]?.icon ?? "🌡️";
}

export function getWeatherLabel(code: number): string {
  return WMO_CODES[code]?.label ?? "Unknown";
}

export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "temperature_2m,weathercode,windspeed_10m",
    daily: "temperature_2m_max,temperature_2m_min,weathercode",
    timezone: "auto",
    forecast_days: "7",
  });

  try {
    const response = await fetch(`${WEATHER_API}/forecast?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const data = await response.json();

    const current: WeatherCurrent = {
      temperature: Math.round(data.current.temperature_2m),
      weathercode: data.current.weathercode,
      windspeed: Math.round(data.current.windspeed_10m),
      time: data.current.time,
    };

    return {
      current,
      forecast: {
        daily: {
          time: data.daily.time,
          temperature_2m_max: data.daily.temperature_2m_max.map(Math.round),
          temperature_2m_min: data.daily.temperature_2m_min.map(Math.round),
          weathercode: data.daily.weathercode,
        },
      },
    };
  } catch {
    return null;
  }
}

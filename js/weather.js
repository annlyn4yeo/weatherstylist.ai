import { CONFIG } from "./config.js";

async function _fetchWeatherData(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch weather data.");
  }

  const data = await res.json();
  const currentData = data.list[0];

  return {
    city: data.city.name,
    current: currentData,
    nextSixHours: data.list.slice(1, 3),
  };
}

export async function getWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_KEY}&units=metric`;
  return _fetchWeatherData(url);
}

export async function getWeatherDataByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${CONFIG.WEATHER_KEY}&units=metric`;
  return _fetchWeatherData(url);
}

import { CONFIG } from "./config.js";

export async function getWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_KEY}&units=metric`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch weather data.");
  }

  const data = await res.json();
  const currentData = data.list[0];

  return {
    city: data.city.name,
    current: currentData,
    // We take the next two intervals for a 6-hour forecast window.
    nextSixHours: data.list.slice(1, 3),
  };
}

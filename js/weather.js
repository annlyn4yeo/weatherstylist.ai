import { CONFIG } from "./config.js";

export async function getWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_KEY}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();

  return {
    city: data.city.name,
    current: data.list[0],
    nextSixHours: data.list.slice(1, 3), // Provides a glimpse into the near future
  };
}

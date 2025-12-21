import { CONFIG } from "./config.js";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${CONFIG.GEMINI_KEY}`;
export async function askGemini(weather, vibe = "minimal", tempAdjustment = 0) {
  const adjustedTemp = weather.current.main.temp + tempAdjustment;
  const prompt = `Location: ${weather.city}. 
    Current: ${adjustedTemp.toFixed(1)}°C, ${
    weather.current.weather[0].description
  }. 
    Forecast: ${weather.nextSixHours[0].main.temp}°C later. 
    Style vibe: ${vibe}.
    Act as a fashion expert. What should I wear? 2 sentences max.`;

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const result = await response.json();
  return result.candidates[0].content.parts[0].text;
}

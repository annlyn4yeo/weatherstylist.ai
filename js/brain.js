import { CONFIG } from "./config.js";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${CONFIG.GEMINI_KEY}`;

export async function askGemini(
  weather,
  vibe = "minimal",
  preferences = {},
  tempAdjustment = 0
) {
  const adjustedTemp = weather.current.main.temp + tempAdjustment;

  let prompt = `Location: ${weather.city}. 
    Current: ${adjustedTemp.toFixed(1)}°C, ${
    weather.current.weather[0].description
  }. 
    Forecast: ${weather.nextSixHours[0].main.temp}°C later. 
    Style vibe: ${vibe}.`;

  if (preferences && Object.keys(preferences).length > 0) {
    prompt += "\nMy preferences:";
    if (preferences.favColors)
      prompt += `\n- Favorite colors: ${preferences.favColors}`;
    if (preferences.neverWear)
      prompt += `\n- I never wear: ${preferences.neverWear}`;
    if (preferences.tempSensitivity) {
      const sensitivityMap = {
        "-1": "I feel cold easily",
        0: "I have a balanced temperature sensitivity",
        1: "I feel warm easily",
      };
      prompt += `\n- Temperature feel: ${
        sensitivityMap[preferences.tempSensitivity]
      }`;
    }
    if (preferences.activityLevel)
      prompt += `\n- My activity level today: ${preferences.activityLevel.replace(
        "_",
        " "
      )}`;
    if (preferences.commuteType)
      prompt += `\n- My commute is by: ${preferences.commuteType}`;
  }

  prompt += "\nAct as a fashion expert. What should I wear? 2 sentences max.";

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  const result = await response.json();
  if (
    !result.candidates ||
    !result.candidates[0] ||
    !result.candidates[0].content ||
    !result.candidates[0].content.parts ||
    !result.candidates[0].content.parts[0]
  ) {
    console.error("Unexpected API response structure:", result);
    throw new Error("Failed to get advice from the AI.");
  }

  return result.candidates[0].content.parts[0].text;
}

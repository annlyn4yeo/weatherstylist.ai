import { getCoords } from "./js/getLocation.js";
import { getWeatherData } from "./js/weather.js";
import { getMomentText, setLoadingState, setErrorState } from "./js/uiUtils.js";

// --- DOM Elements ---
const adviceHeadingEl = document.getElementById("ai-advice-heading");
const adviceBodyEl = document.getElementById("ai-advice-body");
const currentTempEl = document.getElementById("current-temp");
const weatherDescEl = document.getElementById("weather-desc");
const humValEl = document.getElementById("hum-val");
const windValEl = document.getElementById("wind-val");
const momentTextEl = document.getElementById("moment-text");
const refreshIndicatorEl = document.getElementById("refresh-indicator");
const heroLabelEl = document.getElementById("hero-label");
const vibeButtons = document.querySelectorAll(".vibe-btn");

let activeVibe = "minimal"; // Default vibe
let currentWeather = null;

// --- Event Listeners ---

vibeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    activeVibe = btn.dataset.vibe;
    vibeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    getAIAdvice();
  });
});

refreshIndicatorEl.addEventListener("click", () => {
  if (!currentWeather) return;
  // Force a refresh by removing the cached entry for this specific state
  const adjustedTemp = Math.round(currentWeather.current.main.temp);
  const cacheKey = `ai-style-${currentWeather.city}-${adjustedTemp}-${activeVibe}`;
  sessionStorage.removeItem(cacheKey);

  getAIAdvice();
});

async function getAIAdvice(tempAdjustment = 0) {
  const { askGemini } = await import("./js/brain.js");
  if (!currentWeather) return;

  const adjustedTemp =
    Math.round(currentWeather.current.main.temp) + tempAdjustment;

  const cacheKey = `ai-style-${currentWeather.city}-${adjustedTemp}-${activeVibe}`;
  const cachedAdvice = sessionStorage.getItem(cacheKey);

  if (cachedAdvice) {
    adviceBodyEl.textContent = cachedAdvice;
    return;
  }

  adviceHeadingEl.textContent = "Getting your fit...";
  adviceBodyEl.textContent = "The AI is thinking...";

  try {
    const advice = await askGemini(currentWeather, activeVibe, tempAdjustment);
    adviceBodyEl.textContent = advice;
    sessionStorage.setItem(cacheKey, advice);
  } catch (err) {
    console.error(err);
    adviceBodyEl.textContent = "Could not fetch advice.";
  } finally {
    adviceHeadingEl.textContent = "AI Weather Stylist";
  }
}

function updateUI(weather) {
  currentWeather = weather;
  // Main data strip
  currentTempEl.textContent = `${Math.round(weather.current.main.temp)}°`;
  weatherDescEl.textContent = weather.current.description;
  humValEl.textContent = `${weather.current.main.humidity}%`;
  windValEl.textContent = `${Math.round(weather.current.wind.speed)}m/s`;

  // Micro-Moment
  momentTextEl.textContent = getMomentText(weather.nextSixHours);

  // Update hero card to be ready for AI advice
  adviceHeadingEl.textContent = "AI Weather Stylist";
  adviceBodyEl.textContent = `Ready for fashion advice in ${weather.city}?`;

  heroLabelEl.textContent = `Feels Like ${Math.round(
    weather.current.main.feels_like
  )}°`;

  // Update refresh indicator with an emoji based on feels_like
  const fl = weather.current.main.feels_like;
  let emoji = "😊";
  if (fl < 5) emoji = "🥶";
  else if (fl < 15) emoji = "🧥";
  else if (fl < 28) emoji = "😎";
  else emoji = "🔥";
  refreshIndicatorEl.textContent = emoji;
}

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

async function init() {
  try {
    const cachedWeather = sessionStorage.getItem("weatherData");
    if (cachedWeather) {
      const { data, timestamp } = JSON.parse(cachedWeather);
      if (Date.now() - timestamp < CACHE_DURATION_MS) {
        console.log("Using cached weather data.");
        updateUI(data);
        return; // Stop execution if we use cached data
      }
    }

    setLoadingState(
      adviceHeadingEl,
      adviceBodyEl,
      refreshIndicatorEl,
      "Locating you...",
      "Please grant location access."
    );
    const coords = await getCoords();

    setLoadingState(
      adviceHeadingEl,
      adviceBodyEl,
      refreshIndicatorEl,
      "Getting weather...",
      `Location found: ${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}`
    );
    const weather = await getWeatherData(coords.lat, coords.lon);

    // Cache the new data
    sessionStorage.setItem(
      "weatherData",
      JSON.stringify({ data: weather, timestamp: Date.now() })
    );

    updateUI(weather);
  } catch (err) {
    setErrorState(adviceHeadingEl, adviceBodyEl, refreshIndicatorEl);
    console.error(err);
  }
}

// --- Run Application ---
init();

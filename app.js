import { getCoords } from "./js/getLocation.js";
import { getWeatherData, getWeatherDataByCity } from "./js/weather.js";
import {
  getMomentText,
  setLoadingState,
  setErrorState,
  setRefreshIndicatorEmoji,
  setUIState,
  initModal,
} from "./js/uiUtils.js";

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
const cityInputElement = document.getElementById("city-input");

let activeVibe = "minimal"; // Default vibe
let currentWeather = null;

// --- Event Listeners ---
cityInputElement.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    const city = cityInputElement.value.trim();
    if (city) {
      try {
        setUIState(adviceHeadingEl, "loading");
        setUIState(adviceBodyEl, "loading");
        const weather = await getWeatherDataByCity(city);
        sessionStorage.setItem(
          "weatherData",
          JSON.stringify({ data: weather, timestamp: Date.now() })
        );
        updateUI(weather);
        cityInputElement.value = "";
      } catch (err) {
        setErrorState(adviceHeadingEl, adviceBodyEl, refreshIndicatorEl);
        console.error(err);
      }
    }
  }
});

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
  if (!currentWeather) return;

  // Show loading state while AI is thinking
  setUIState(adviceHeadingEl, "loading");
  setUIState(adviceBodyEl, "loading");
  const adjustedTemp =
    Math.round(currentWeather.current.main.temp) + tempAdjustment;

  const cacheKey = `ai-style-${currentWeather.city}-${adjustedTemp}-${activeVibe}`;
  const cachedAdvice = sessionStorage.getItem(cacheKey);
  let adviceToDisplay = "";

  if (cachedAdvice) {
    adviceToDisplay = cachedAdvice;
  } else {
    try {
      const { askGemini } = await import("./js/brain.js");
      adviceToDisplay = await askGemini(
        currentWeather,
        activeVibe,
        tempAdjustment
      );
      sessionStorage.setItem(cacheKey, adviceToDisplay);
    } catch (err) {
      console.error(err);
      setUIState(adviceHeadingEl, "error");
      setUIState(adviceBodyEl, "error");
      return; // If there's an error, return after setting error state
    }
  }

  // Common UI updates for success cases
  const resultSlot = adviceBodyEl.querySelector('[data-state="result"]');
  resultSlot.textContent = adviceToDisplay;

  setUIState(adviceHeadingEl, "idle");
  setUIState(adviceBodyEl, "result");
  setRefreshIndicatorEmoji(currentWeather);
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
  const idleSlot = adviceBodyEl.querySelector('[data-state="idle"]');
  idleSlot.textContent = `Ready for fashion advice in ${weather.city}?`;

  setUIState(adviceHeadingEl, "idle");
  setUIState(adviceBodyEl, "idle");

  heroLabelEl.textContent = `Feels Like ${Math.round(
    weather.current.main.feels_like
  )}°`;
  setRefreshIndicatorEmoji(weather);
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

    setUIState(adviceHeadingEl, "loading");
    setUIState(adviceBodyEl, "loading");
    const coords = await getCoords();
    setUIState(adviceHeadingEl, "loading");
    setUIState(adviceBodyEl, "loading");
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
initModal();

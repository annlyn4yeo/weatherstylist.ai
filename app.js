import { getCoords } from "./js/getLocation.js";
import { getWeatherData } from "./js/weather.js";
import { askGemini } from "./js/brain.js";

const btn = document.querySelector("button");
const adviceBox = document.querySelector("#ai-advice");

btn.addEventListener("click", async () => {
  try {
    adviceBox.innerText = "Locating you...";
    const coords = await getCoords();
    adviceBox.innerText = "Getting weather...";
    const weather = await getWeatherData(coords.lat, coords.lon);
    adviceBox.innerText = "AI is thinking...";
    const advice = await askGemini(weather);
    adviceBox.innerText = advice;
  } catch (err) {
    adviceBox.innerText = "Error: Make sure your keys are active!";
    console.error(err);
  }
});

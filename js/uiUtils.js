export function getMomentText(threeHourForecast) {
  const nextPeriod = threeHourForecast[0];
  if (nextPeriod) {
    // The API gives temp in main.temp
    return `In 3 hours: ${nextPeriod.weather[0].description} at ${Math.round(
      nextPeriod.main.temp
    )}°`;
  }
  return "No forecast available.";
}

export function setLoadingState(
  adviceHeadingEl,
  adviceBodyEl,
  refreshIndicatorEl,
  message,
  body = ""
) {
  adviceHeadingEl.textContent = message;
  adviceBodyEl.textContent = body;
  refreshIndicatorEl.style.display = "block";
  refreshIndicatorEl.textContent = "⏳";
}

export function setErrorState(
  adviceHeadingEl,
  adviceBodyEl,
  refreshIndicatorEl,
  message = "Error",
  body = "Could not fetch data. Make sure your API keys are valid."
) {
  adviceHeadingEl.textContent = message;
  adviceBodyEl.textContent = body;
  refreshIndicatorEl.style.display = "none";
}

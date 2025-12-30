export function getMomentText(threeHourForecast) {
  const nextPeriod = threeHourForecast[0];
  if (nextPeriod) {
    // The API gives temp in main.temp
    return `${nextPeriod.weather[0].description} at ${Math.round(
      nextPeriod.main.temp
    )}°`;
  }
  return "No forecast available.";
}

export function setRefreshIndicatorEmoji(weather) {
  const refreshIndicatorEl = document.getElementById("refresh-indicator");
  const fl = weather.current.main.feels_like;
  let emoji = "😊";
  if (fl < 5) emoji = "🥶";
  else if (fl < 18) emoji = "🧥";
  else if (fl < 28) emoji = "😎";
  else emoji = "🔥";
  refreshIndicatorEl.textContent = emoji;
  refreshIndicatorEl.style.display = "block";
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

export function setUIState(container, state) {
  const nodes = container.querySelectorAll("[data-state]");
  for (const el of nodes) {
    el.hidden = el.dataset.state !== state;
  }
}

export function initModal() {
  const modal = document.getElementById("personalization-modal");
  const cta = document.getElementById("personalization-cta");
  const closeBtn = document.getElementById("modal-close-btn");

  function openModal() {
    modal.style.display = "flex";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  cta.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

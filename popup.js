document.addEventListener("DOMContentLoaded", () => {
  const currencySelect = document.getElementById("currencySelect");
  const saveButton = document.getElementById("saveCurrency");

  chrome.storage.sync.get("preferredCurrency", ({ preferredCurrency }) => {
    if (preferredCurrency) {
      currencySelect.value = preferredCurrency;
    }
  });

  saveButton.addEventListener("click", () => {
    const selectedCurrency = currencySelect.value;
    chrome.storage.sync.set({ preferredCurrency: selectedCurrency }, () => {
      alert("Preference saved! Refresh to apply changes.");
    });
  });
});

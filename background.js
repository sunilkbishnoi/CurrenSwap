const API_URL = "https://api.exchangerate-api.com/v4/latest/USD";

let exchangeRates = {};

async function fetchExchangeRates() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        exchangeRates = data.rates;
        console.log("Exchange rates updated:", exchangeRates);
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
    }
}

fetchExchangeRates();
setInterval(fetchExchangeRates, 3600000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "convertCurrency") {
        const { amount, fromCurrency, toCurrency } = request;
        if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
            let convertedAmount = (amount / exchangeRates[fromCurrency]) * exchangeRates[toCurrency];

            convertedAmount = Math.round(convertedAmount * 100) / 100;

            const currencySymbols = { USD: "$", EUR: "€", INR: "₹", GBP: "£" };
            const symbol = currencySymbols[toCurrency] || toCurrency;

            let formattedAmount;
            if (toCurrency === "INR") {
                formattedAmount = new Intl.NumberFormat("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(convertedAmount);
            } else {
                formattedAmount = new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(convertedAmount);
            }

            sendResponse({ success: true, convertedAmount: `${symbol} ${formattedAmount}` });
        } else {
            sendResponse({ success: false, message: "Invalid currency" });
        }
    }
    return true;
});

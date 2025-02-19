chrome.storage.sync.get("preferredCurrency", ({ preferredCurrency }) => {
    if (!preferredCurrency) return;

    const currencySymbols = {
        "$": "USD",
        "€": "EUR",
        "₹": "INR",
        "£": "GBP"
    };

    async function convertCurrency(amount, fromSymbol) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(
                { action: "convertCurrency", amount, fromCurrency: currencySymbols[fromSymbol], toCurrency: preferredCurrency },
                (response) => {
                    if (response.success) {
                        resolve(response.convertedAmount);
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    }

    async function replacePrices() {
        const priceRegex = /([$€₹£])\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/g;

        const textNodes = [];
        document.querySelectorAll("*:not(script):not(style)").forEach((node) => {
            if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
                textNodes.push(node);
            }
        });

        for (const node of textNodes) {
            let text = node.textContent;
            let matches = [...text.matchAll(priceRegex)];

            for (const match of matches) {
                const [fullMatch, symbol, amount] = match;
                let parsedAmount = parseFloat(amount.replace(/,/g, ""));
                let converted = await convertCurrency(parsedAmount, symbol);

                if (converted) {
                    text = text.replace(fullMatch, converted);
                }
            }

            node.textContent = text;
        }
    }

    const observer = new MutationObserver(replacePrices);
    observer.observe(document.body, { childList: true, subtree: true });

    replacePrices();
});

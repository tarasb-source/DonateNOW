const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function formatUsd(amount) {
    return usd.format(amount);
}

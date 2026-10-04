// OpenStreetMap's Nominatim geocoder, shared by the /api/geocode route and the event importer.
// Usage policy: identify the app, at most 1 request/second, cache results.
// https://operations.osmfoundation.org/policies/nominatim/
const USER_AGENT = "DonateNOW/1.0 (+https://github.com/tarasb-source/DonateNOW)";
const MIN_INTERVAL_MS = 1100;

let queue = Promise.resolve();

// Chain upstream calls so they never run closer together than MIN_INTERVAL_MS.
function throttled(fn) {
    const result = queue.then(fn);
    queue = result.catch(() => {}).then(() => new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS)));
    return result;
}

// Returns { name, latitude, longitude } or null when nothing matches.
export function geocode(query) {
    return throttled(async () => {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        // English names, so "Lviv" comes back as "Lviv" rather than "Львів".
        url.search = new URLSearchParams({ q: query, format: "jsonv2", limit: "1", "accept-language": "en" });

        const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
        if (!response.ok) throw new Error(`Nominatim responded ${response.status}`);

        const [place] = await response.json();
        return place
            ? { name: place.display_name, latitude: Number(place.lat), longitude: Number(place.lon) }
            : null;
    });
}

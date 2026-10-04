// Fetches the "Events" box from Google search results via SerpApi.
// (SerpApi's dedicated google_events engine is no longer offered; the regular Google engine
// still returns `events_results` for queries like "Ukrainian events in Chicago".)

export async function searchGoogleEvents(query, apiKey) {
    const url = new URL("https://serpapi.com/search.json");
    url.search = new URLSearchParams({ engine: "google", q: query, hl: "en", gl: "us", api_key: apiKey });

    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));
    // Never include the URL in errors: it contains the API key.
    if (!response.ok || data.error) {
        throw new Error(`SerpApi search for "${query}" failed: ${data.error ?? response.status}`);
    }

    return (data.events_results ?? []).map((raw) => ({
        title: raw.title?.trim() ?? "",
        type: raw.type?.trim() ?? "",
        date: raw.date ?? "",
        time: raw.time ?? "",
        venue: raw.address?.[0]?.trim() ?? "",
        cityLine: raw.address?.[1]?.trim() ?? "",
    }));
}

// Stable identity for an event across searches and weekly runs.
export function googleEventId({ title, date, venue }) {
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    return [normalize(title), normalize(date), normalize(venue)].join("|");
}

// Google results have no link; a search for the event is the next best thing until a reviewer adds one.
export function googleSearchLink({ title, venue, city }) {
    return `https://www.google.com/search?${new URLSearchParams({ q: [title, venue, city].filter(Boolean).join(" ") })}`;
}

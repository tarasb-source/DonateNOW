import { useCallback, useState } from "react";
import { geocode } from "../../api/geocode.js";
import { useGeolocation } from "../../hooks/useGeolocation.js";
import { buttonStyles } from "../ui/buttonStyles.js";

// Lets the visitor pick where to search from: their browser location or a typed city.
export default function LocationBar({ origin, onChange }) {
    const handleLocated = useCallback((position) => onChange({ ...position, label: "your location" }), [onChange]);
    const { locating, error: locationError, locate } = useGeolocation(handleLocated);

    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    async function handleSearch(e) {
        e.preventDefault();
        if (query.trim().length < 2) return;

        setSearching(true);
        setSearchError(null);
        try {
            const place = await geocode(query.trim());
            // Nominatim names are long ("Lviv, Lviv Urban Hromada, ..., Ukraine"); keep place + country.
            const parts = place.name.split(",").map((part) => part.trim());
            const label = parts.length > 1 ? `${parts[0]}, ${parts.at(-1)}` : parts[0];
            onChange({ latitude: place.latitude, longitude: place.longitude, label });
        } catch (error) {
            setSearchError(error.message);
        } finally {
            setSearching(false);
        }
    }

    const error = searchError ?? locationError;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
                <button
                    type="button"
                    onClick={() => { setSearchError(null); locate(); }}
                    disabled={locating}
                    className={`${buttonStyles()} disabled:cursor-wait disabled:opacity-60`}
                >
                    {locating ? "Locating..." : "📍 Use my location"}
                </button>
                <span className="text-gray-500">or</span>
                <form onSubmit={handleSearch} className="flex flex-1 gap-2 sm:max-w-md">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter a city, e.g. Chicago"
                        aria-label="City"
                        className="min-w-0 flex-1 rounded-md border-2 border-[#cccccc] px-4 py-2.5 transition focus:border-brand focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        className={`${buttonStyles("primary", "sm")} disabled:cursor-wait disabled:opacity-60`}
                    >
                        {searching ? "..." : "Search"}
                    </button>
                </form>
            </div>

            {error && <p className="text-red-700">{error}</p>}

            {origin && (
                <p>
                    Showing events near <strong>{origin.label}</strong>{" "}
                    <button type="button" onClick={() => onChange(null)} className="cursor-pointer text-brand underline">
                        Show all events
                    </button>
                </p>
            )}
        </div>
    );
}

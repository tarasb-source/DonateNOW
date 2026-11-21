import { useState } from "react";
import FilterButtons from "../components/FilterButtons.jsx";
import EventCard from "../components/events/EventCard.jsx";
import EventMap from "../components/events/EventMap.jsx";
import LocationBar from "../components/events/LocationBar.jsx";
import { useEvents } from "../hooks/useEvents.js";

const ANY_DISTANCE_KM = 20000;
const radiusOptions = [
    ...[25, 50, 100, 250, 500].map((km) => ({ value: km, label: `${km} km` })),
    { value: ANY_DISTANCE_KM, label: "Any distance" },
];
const sortOptions = [
    { value: "distance", label: "Distance" },
    { value: "date", label: "Date" },
];

const byDate = (a, b) => new Date(a.startsAt) - new Date(b.startsAt);
const byDistance = (a, b) => a.distanceKm - b.distanceKm || byDate(a, b);

export default function Events() {
    const [origin, setOrigin] = useState(null);
    const [radius, setRadius] = useState(100);
    const [selectedId, setSelectedId] = useState(null);
    const [sortBy, setSortBy] = useState("distance");
    const { events, loading, error } = useEvents({ origin, radius });
    const sortedEvents = [...events].sort(origin && sortBy === "distance" ? byDistance : byDate);

    function toggleSelect(id) {
        setSelectedId((current) => (current === id ? null : id));
    }

    function selectFromMap(id) {
        const willSelect = selectedId !== id;
        toggleSelect(id);
        if (willSelect) {
            document.getElementById(`event-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    function resetView() {
        setSelectedId(null);
        setOrigin(null);
    }

    const radiusLabel = radiusOptions.find((o) => o.value === radius)?.label;

    let emptyMessage = "There are no upcoming events yet. Check back soon!";
    if (origin) {
        emptyMessage = radius === ANY_DISTANCE_KM
            ? "There are no upcoming events yet. Check back soon!"
            : `No upcoming events within ${radiusLabel} of ${origin.label}. Try a larger distance.`;
    }

    return (
        <div className="mx-auto my-8 flex w-full max-w-6xl flex-col gap-6 px-4 text-center">
            <h2>Events Near You</h2>
            <p>Find rallies, fundraisers, and volunteer meetups supporting Ukraine in your area.</p>

            <LocationBar origin={origin} onChange={setOrigin} />
            {origin && <FilterButtons options={radiusOptions} current={radius} onChange={setRadius} />}

            <hr className="border-gray-200" />

            <div className="grid gap-6 md:grid-cols-2">
                <div className="h-[320px] md:sticky md:top-4 md:h-[600px]">
                    <EventMap
                        events={events}
                        origin={origin}
                        radiusKm={radius}
                        selectedId={selectedId}
                        onSelect={selectFromMap}
                        onReset={resetView}
                    />
                </div>

                <div className={`flex flex-col gap-4 transition-opacity ${loading ? "opacity-50" : ""}`}>
                    {origin && events.length > 1 && (
                        <label className="flex items-center justify-end gap-2 text-sm">
                            <span className="text-gray-500">Sort by</span>
                            <span className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="cursor-pointer appearance-none rounded-full border border-[#e3d9c6] bg-transparent py-1 pr-8 pl-3.5 text-black transition hover:border-[#cbbda3] focus:border-azure focus:outline-none"
                                >
                                    {sortOptions.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-gray-500"
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </span>
                        </label>
                    )}
                    {error ? (
                        <p className="text-red-700">Couldn't load events. Please try again later.</p>
                    ) : !loading && events.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-gray-300 p-8 font-semibold text-gray-600">{emptyMessage}</p>
                    ) : (
                        sortedEvents.map((event) => (
                            <EventCard key={event.id} event={event} selected={event.id === selectedId} onSelect={toggleSelect} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

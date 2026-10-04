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

export default function Events() {
    // { latitude, longitude, label } once the visitor shares a location or searches a city.
    const [origin, setOrigin] = useState(null);
    const [radius, setRadius] = useState(100);
    const [selectedId, setSelectedId] = useState(null);
    const { events, loading, error } = useEvents({ origin, radius });

    function selectFromMap(id) {
        setSelectedId(id);
        document.getElementById(`event-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

            <hr className="border-gray-300" />

            <div className="grid gap-6 md:grid-cols-2">
                <div className="h-[320px] md:sticky md:top-4 md:h-[600px]">
                    <EventMap
                        events={events}
                        origin={origin}
                        radiusKm={radius}
                        selectedId={selectedId}
                        onSelect={selectFromMap}
                    />
                </div>

                <div className={`flex flex-col gap-4 transition-opacity ${loading ? "opacity-50" : ""}`}>
                    {error ? (
                        <p className="text-red-700">Couldn't load events. Please try again later.</p>
                    ) : !loading && events.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-gray-300 p-8 text-gray-600">{emptyMessage}</p>
                    ) : (
                        events.map((event) => (
                            <EventCard key={event.id} event={event} selected={event.id === selectedId} onSelect={setSelectedId} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

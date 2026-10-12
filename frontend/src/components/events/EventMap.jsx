import { useEffect, useRef } from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { latLng, latLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatEventDate } from "../../lib/formatDate.js";

const WORLD_VIEW = { center: [30, 0], zoom: 2 };
const BRAND = "#1789fc";
const ACCENT = "#fdb833";

// Frames the search radius/events; falls back to the whole world when there's nothing to show.
function frameOverview(map, events, origin, radiusKm, animate) {
    const points = events.map((e) => [e.latitude, e.longitude]);
    const fit = animate ? map.flyToBounds.bind(map) : map.fitBounds.bind(map);

    if (origin) {
        const center = latLng(origin.latitude, origin.longitude);
        // Frame the search radius when it's local; otherwise frame what we found.
        const bounds = radiusKm <= 500 ? center.toBounds(radiusKm * 2000) : latLngBounds([center]);
        points.forEach((p) => bounds.extend(p));
        fit(bounds, { padding: [20, 20], maxZoom: 12, duration: animate ? 0.6 : undefined });
    } else if (points.length > 0) {
        fit(latLngBounds(points), { padding: [30, 30], maxZoom: 10, duration: animate ? 0.6 : undefined });
    } else if (animate) {
        map.flyTo(WORLD_VIEW.center, WORLD_VIEW.zoom, { duration: 0.6 });
    } else {
        map.setView(WORLD_VIEW.center, WORLD_VIEW.zoom);
    }
}

// Keeps the view framed around the search area/events, flies to the selected event, and flies
// back to the overview when it's deselected.
function MapViewController({ events, origin, radiusKm, selected }) {
    const map = useMap();
    const frameKey = `${origin?.latitude},${origin?.longitude},${radiusKm},${events.map((e) => e.id).join(",")}`;
    const hadSelection = useRef(false);

    useEffect(() => {
        frameOverview(map, events, origin, radiusKm, false);
        // frameKey summarizes events/origin/radius so we only refit when they change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, frameKey]);

    useEffect(() => {
        if (selected) {
            hadSelection.current = true;
            map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 11), { duration: 0.6 });
        } else if (hadSelection.current) {
            hadSelection.current = false;
            frameOverview(map, events, origin, radiusKm, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, selected]);

    return null;
}

export default function EventMap({ events, origin, radiusKm, selectedId, onSelect }) {
    const selected = events.find((e) => e.id === selectedId) ?? null;

    return (
        // `isolate` keeps Leaflet's high z-indexes from covering the header menu and modals.
        <div className="isolate relative size-full overflow-hidden rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
            <MapContainer center={WORLD_VIEW.center} zoom={WORLD_VIEW.zoom} scrollWheelZoom={false} className="size-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {origin && (
                    <>
                        {radiusKm <= 500 && (
                            <Circle
                                center={[origin.latitude, origin.longitude]}
                                radius={radiusKm * 1000}
                                pathOptions={{ color: BRAND, weight: 1, fillOpacity: 0.05 }}
                            />
                        )}
                        <CircleMarker
                            center={[origin.latitude, origin.longitude]}
                            radius={7}
                            pathOptions={{ color: "white", weight: 3, fillColor: "#000000", fillOpacity: 1 }}
                        >
                            <Popup>Searching near {origin.label}</Popup>
                        </CircleMarker>
                    </>
                )}

                {events.map((event) => {
                    const isSelected = event.id === selectedId;
                    return (
                        <CircleMarker
                            key={event.id}
                            center={[event.latitude, event.longitude]}
                            radius={isSelected ? 11 : 8}
                            pathOptions={{ color: "white", weight: 2, fillColor: isSelected ? ACCENT : BRAND, fillOpacity: 1 }}
                            eventHandlers={{ click: () => onSelect(event.id) }}
                        >
                            <Popup>
                                <strong>{event.title}</strong>
                                <br />
                                {formatEventDate(event.startsAt, event.endsAt)}
                                <br />
                                {event.city}, {event.country}
                            </Popup>
                        </CircleMarker>
                    );
                })}

                <MapViewController events={events} origin={origin} radiusKm={radiusKm} selected={selected} />
            </MapContainer>

            {selectedId && (
                <button
                    type="button"
                    onClick={() => onSelect(selectedId)}
                    className="absolute top-3 right-3 z-[1000] cursor-pointer rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition hover:bg-jasmine/60"
                >
                    ↺ Recenter
                </button>
            )}
        </div>
    );
}

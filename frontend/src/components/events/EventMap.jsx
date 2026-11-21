import { useEffect, useRef, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { divIcon, latLng, latLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatEventDate } from "../../lib/formatDate.js";

const WORLD_VIEW = { center: [30, 0], zoom: 2 };
const BRAND = "#1789fc";
const ACCENT = "#fdb833";
const ANIMATION_MS = 600;
const CIRCLE_ANIMATION_MS = 350;

function useTweenedNumber(target) {
    const [value, setValue] = useState(target);
    const current = useRef(target);

    useEffect(() => {
        const from = current.current;
        if (from === target) return;

        const startedAt = performance.now();
        let frame;
        const step = (now) => {
            const progress = Math.min((now - startedAt) / CIRCLE_ANIMATION_MS, 1);
            const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
            current.current = from * (target / from) ** eased;
            setValue(current.current);
            if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [target]);

    return value;
}

const dotIcons = new Map();

function dotIcon(fill, diameter, border) {
    const key = `${fill}|${diameter}|${border}`;
    if (!dotIcons.has(key)) {
        dotIcons.set(key, divIcon({
            className: "",
            html: `<span style="display:block;box-sizing:border-box;width:${diameter}px;height:${diameter}px;border-radius:50%;background:${fill};border:${border}px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.35)"></span>`,
            iconSize: [diameter, diameter],
            popupAnchor: [0, -diameter / 2],
        }));
    }
    return dotIcons.get(key);
}

function SearchRadius({ center, radiusKm }) {
    const radius = useTweenedNumber(radiusKm * 1000);
    return <Circle center={center} radius={radius} pathOptions={{ color: BRAND, weight: 1, fillOpacity: 0.05 }} />;
}

function frameOverview(map, events, origin, radiusKm, animate) {
    const points = events.map((e) => [e.latitude, e.longitude]);
    const fit = animate ? map.flyToBounds.bind(map) : map.fitBounds.bind(map);
    const motion = animate ? { duration: ANIMATION_MS / 1000 } : { animate: false };

    if (origin && radiusKm <= 500) {
        const center = latLng(origin.latitude, origin.longitude);
        fit(center.toBounds(radiusKm * 2000), { padding: [20, 20], maxZoom: 12, ...motion });
    } else if (origin) {
        const bounds = latLngBounds([latLng(origin.latitude, origin.longitude)]);
        points.forEach((p) => bounds.extend(p));
        fit(bounds, { padding: [20, 20], maxZoom: 12, ...motion });
    } else if (points.length > 0) {
        fit(latLngBounds(points), { padding: [30, 30], maxZoom: 10, ...motion });
    } else if (animate) {
        map.flyTo(WORLD_VIEW.center, WORLD_VIEW.zoom, { duration: ANIMATION_MS / 1000 });
    } else {
        map.setView(WORLD_VIEW.center, WORLD_VIEW.zoom, { animate: false });
    }
}

function MapViewController({ events, origin, radiusKm, selected, recenterCount, onUserMove }) {
    const map = useMap();
    const circleCenter = origin && radiusKm <= 500 ? `${origin.latitude},${origin.longitude}` : null;
    const frameKey = circleCenter
        ? `${circleCenter},${radiusKm}`
        : `${origin?.latitude},${origin?.longitude},${radiusKm},${events.map((e) => e.id).join(",")}`;
    const lastCircle = useRef(null);
    const hadSelection = useRef(false);
    const hasFramedContent = useRef(false);
    const movingProgrammatically = useRef(false);

    function moveMap(move) {
        movingProgrammatically.current = true;
        try {
            move();
        } finally {
            movingProgrammatically.current = false;
        }
    }

    useMapEvents({
        dragstart: onUserMove,
        zoomstart: () => {
            if (!movingProgrammatically.current) onUserMove();
        },
    });

    useEffect(() => {
        const onlyRadiusChanged = circleCenter !== null && lastCircle.current?.center === circleCenter;
        lastCircle.current = circleCenter && { center: circleCenter, radiusKm };

        const animate = hasFramedContent.current;
        if (events.length > 0 || origin) hasFramedContent.current = true;
        const frame = () => moveMap(() => frameOverview(map, events, origin, radiusKm, animate));

        if (!onlyRadiusChanged) {
            frame();
            return;
        }
        const timer = setTimeout(frame, CIRCLE_ANIMATION_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, frameKey]);

    useEffect(() => {
        if (selected) {
            hadSelection.current = true;
            moveMap(() => map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 11), { duration: ANIMATION_MS / 1000 }));
        } else if (hadSelection.current) {
            hadSelection.current = false;
            moveMap(() => frameOverview(map, events, origin, radiusKm, true));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, selected]);

    useEffect(() => {
        if (recenterCount > 0) moveMap(() => frameOverview(map, events, origin, radiusKm, true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, recenterCount]);

    return null;
}

export default function EventMap({ events, origin, radiusKm, selectedId, onSelect, onReset }) {
    const selected = events.find((e) => e.id === selectedId) ?? null;
    const [movedByUser, setMovedByUser] = useState(false);
    const [recenterCount, setRecenterCount] = useState(0);
    const showRecenter = movedByUser || selectedId !== null || origin !== null;

    function recenter() {
        setMovedByUser(false);
        if (selectedId !== null || origin !== null) {
            onReset();
        } else {
            setRecenterCount((count) => count + 1);
        }
    }

    return (
        <div className="isolate relative size-full overflow-hidden rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
            <MapContainer center={WORLD_VIEW.center} zoom={WORLD_VIEW.zoom} scrollWheelZoom={false} className="size-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {origin && (
                    <>
                        {radiusKm <= 500 && <SearchRadius center={[origin.latitude, origin.longitude]} radiusKm={radiusKm} />}
                        <Marker position={[origin.latitude, origin.longitude]} icon={dotIcon("#000000", 17, 3)}>
                            <Popup>Searching near {origin.label}</Popup>
                        </Marker>
                    </>
                )}

                {events.map((event) => {
                    const isSelected = event.id === selectedId;
                    return (
                        <Marker
                            key={event.id}
                            position={[event.latitude, event.longitude]}
                            icon={isSelected ? dotIcon(ACCENT, 24, 2) : dotIcon(BRAND, 18, 2)}
                            zIndexOffset={isSelected ? 1000 : 0}
                            eventHandlers={{ click: () => onSelect(event.id) }}
                        >
                            <Popup>
                                <strong>{event.title}</strong>
                                <br />
                                {formatEventDate(event)}
                                <br />
                                {event.city}, {event.country}
                            </Popup>
                        </Marker>
                    );
                })}

                <MapViewController
                    events={events}
                    origin={origin}
                    radiusKm={radiusKm}
                    selected={selected}
                    recenterCount={recenterCount}
                    onUserMove={() => setMovedByUser(true)}
                />
            </MapContainer>

            {showRecenter && (
                <button
                    type="button"
                    onClick={recenter}
                    className="absolute top-3 right-3 z-[1000] cursor-pointer rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition hover:bg-jasmine/60"
                >
                    ↺ Recenter
                </button>
            )}
        </div>
    );
}

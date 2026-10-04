import tzlookup from "@photostructure/tz-lookup";
import { prisma } from "../db.js";
import { distanceKm } from "../lib/geo.js";
import { geocode } from "../lib/nominatim.js";
import { cities } from "./cities.js";
import { googleEventId, googleSearchLink, searchGoogleEvents } from "./googleEvents.js";
import { parseEventTiming } from "./parseEventTiming.js";
import { isUkraineRelated } from "./relevance.js";

const SOURCE = "google";
// A venue match farther than this from its city is a different place with the same name.
const MAX_VENUE_DISTANCE_KM = 50;

// Searches Google events for each city, keeps Ukraine-related upcoming ones that we haven't
// seen before, and saves them as PENDING for review. Returns counts for logging.
export async function importEvents({ apiKey, maxSearches = cities.length, onlyCities, dryRun = false, log = console.log }) {
    const searchCities = (onlyCities?.length ? onlyCities : cities).slice(0, maxSearches);
    const stats = { searches: 0, found: 0, unrelated: 0, duplicates: 0, alreadyKnown: 0, unplaceable: 0, past: 0, saved: 0 };
    const now = new Date();
    const candidates = new Map();
    const placeCache = new Map();

    async function locate(query) {
        if (!placeCache.has(query)) placeCache.set(query, await geocode(query).catch(() => null));
        return placeCache.get(query);
    }

    for (const city of searchCities) {
        let results;
        try {
            results = await searchGoogleEvents(`Ukrainian events in ${city}`, apiKey);
        } catch (error) {
            log(`  ! ${error.message}`);
            continue;
        }
        stats.searches += 1;
        stats.found += results.length;
        log(`${city}: ${results.length} events`);

        for (const event of results) {
            // The second address line is usually "City, ST" but sometimes just a neighborhood
            // ("Downtown", "Ohio City"); then the city is the one we searched in.
            const hasState = /,\s*[A-Z]{2}$/.test(event.cityLine);
            event.city = hasState ? event.cityLine : city;
            event.neighborhood = hasState ? "" : event.cityLine;

            if (!event.title || !isUkraineRelated(event)) {
                stats.unrelated += 1;
                continue;
            }
            const sourceId = googleEventId(event);
            if (candidates.has(sourceId)) {
                stats.duplicates += 1;
                continue;
            }
            candidates.set(sourceId, event);
        }
    }

    // Skip anything imported before, including events a reviewer rejected.
    const known = await prisma.event.findMany({
        where: { source: SOURCE, sourceId: { in: [...candidates.keys()] } },
        select: { sourceId: true },
    });
    for (const { sourceId } of known) candidates.delete(sourceId);
    stats.alreadyKnown = known.length;

    const rows = [];
    for (const [sourceId, event] of candidates) {
        // Prefer the venue's exact spot, but only if it's actually in that city; otherwise use the city.
        const cityPlace = await locate(event.city);
        const venuePlace = event.venue
            ? await locate([event.venue, event.neighborhood, event.city].filter(Boolean).join(", "))
            : null;
        const venueIsInCity =
            venuePlace && cityPlace &&
            distanceKm(venuePlace.latitude, venuePlace.longitude, cityPlace.latitude, cityPlace.longitude) <= MAX_VENUE_DISTANCE_KM;
        const place = venueIsInCity ? venuePlace : cityPlace;
        if (!place) {
            stats.unplaceable += 1;
            log(`  ? couldn't locate "${event.venue}, ${event.city}" for "${event.title}"`);
            continue;
        }

        const timeZone = tzlookup(place.latitude, place.longitude);
        const timing = parseEventTiming(event, { timeZone, now });
        if (!timing || (timing.endsAt ?? timing.startsAt) < now) {
            stats.past += 1;
            continue;
        }

        rows.push({
            title: event.title.slice(0, 200),
            organization: event.venue || "Unknown organizer",
            description: [event.type, timing.timeKnown ? "" : "Time not listed."].filter(Boolean).join(". "),
            link: googleSearchLink(event),
            startsAt: timing.startsAt,
            endsAt: timing.endsAt,
            address: event.venue,
            city: event.city,
            country: "USA",
            latitude: place.latitude,
            longitude: place.longitude,
            status: "PENDING",
            source: SOURCE,
            sourceId,
        });
        log(`  + ${event.title} (${event.date} ${event.time}, ${event.venue})`);
    }

    if (!dryRun && rows.length > 0) {
        // skipDuplicates guards against a concurrent run inserting the same event.
        const { count } = await prisma.event.createMany({ data: rows, skipDuplicates: true });
        stats.saved = count;
    }

    return { ...stats, newEvents: rows.length };
}

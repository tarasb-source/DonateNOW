import { getEvents } from "../api/events.js";
import { useFetch } from "./useFetch.js";

// origin: { latitude, longitude } or null to list all upcoming events.
export function useEvents({ origin, radius }) {
    const key = origin ? `${origin.latitude},${origin.longitude},${radius}` : "all";

    const { data, error, loading } = useFetch(key, (signal) => getEvents({ origin, radius }, signal));

    return { events: data ?? [], error, loading };
}

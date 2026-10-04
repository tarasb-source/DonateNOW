import { useEffect, useState } from "react";
import { getOpportunities } from "../api/opportunities.js";
import { useDebouncedValue } from "./useDebouncedValue.js";

export function useOpportunities({ search, category }) {
    // Wait for the user to stop typing before hitting the API.
    const q = useDebouncedValue(search.trim(), 300);
    const key = `${q}|${category}`;

    // Results remember which query they belong to, so "loading" is derived instead of stored.
    const [result, setResult] = useState({ key: null, opportunities: [], error: null });

    useEffect(() => {
        const controller = new AbortController();

        getOpportunities({ q, category }, controller.signal)
            .then((opportunities) => setResult({ key, opportunities, error: null }))
            .catch((error) => {
                if (!controller.signal.aborted) setResult({ key, opportunities: [], error });
            });

        return () => controller.abort();
    }, [q, category, key]);

    return { ...result, loading: result.key !== key };
}

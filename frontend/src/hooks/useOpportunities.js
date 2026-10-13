import { getOpportunities } from "../api/opportunities.js";
import { useDebouncedValue } from "./useDebouncedValue.js";
import { useFetch } from "./useFetch.js";

export function useOpportunities({ search, category }) {
    const q = useDebouncedValue(search.trim(), 300);

    const { data, error, loading } = useFetch(`${q}|${category}`, (signal) =>
        getOpportunities({ q, category }, signal)
    );

    return { opportunities: data ?? [], error, loading };
}

import { useEffect, useState } from "react";

// Runs fetcher(signal) whenever `key` changes, aborting the previous request.
// Results remember which key they belong to, so "loading" is derived instead of stored,
// and the previous data stays available while the next request is in flight.
export function useFetch(key, fetcher) {
    const [result, setResult] = useState({ key: null, data: null, error: null });

    useEffect(() => {
        const controller = new AbortController();

        fetcher(controller.signal)
            .then((data) => setResult({ key, data, error: null }))
            .catch((error) => {
                if (!controller.signal.aborted) setResult({ key, data: null, error });
            });

        return () => controller.abort();
        // The fetcher is recreated every render; `key` captures everything it depends on.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { data: result.data, error: result.error, loading: result.key !== key };
}

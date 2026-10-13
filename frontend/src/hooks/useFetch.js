import { useEffect, useState } from "react";

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { data: result.data, error: result.error, loading: result.key !== key };
}

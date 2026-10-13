import { useCallback, useState } from "react";

const messages = {
    unsupported: "Your browser can't share your location. Search for a city instead.",
    denied: "Location access was blocked. Search for a city instead.",
    error: "We couldn't get your location. Search for a city instead.",
};

export function useGeolocation(onLocated) {
    const [status, setStatus] = useState("idle");

    const locate = useCallback(() => {
        if (!navigator.geolocation) {
            setStatus("unsupported");
            return;
        }

        setStatus("locating");
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setStatus("idle");
                onLocated({ latitude: coords.latitude, longitude: coords.longitude });
            },
            (error) => setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
            { timeout: 10000, maximumAge: 10 * 60 * 1000 }
        );
    }, [onLocated]);

    return { locating: status === "locating", error: messages[status] ?? null, locate };
}

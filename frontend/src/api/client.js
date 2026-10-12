const API_URL = import.meta.env.VITE_API_URL ?? "";

export async function apiFetch(path, { body, ...options } = {}) {
    const response = await fetch(`${API_URL}/api${path}`, {
        ...options,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.error ?? `Request failed (${response.status})`);
    }
    return data;
}

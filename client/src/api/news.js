import { apiFetch } from "./client.js";

export function getNews(signal) {
    return apiFetch("/news", { signal });
}

import { apiFetch } from "./client.js";

export function sendContactMessage(message) {
    return apiFetch("/contact", { method: "POST", body: message });
}

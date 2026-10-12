const dateFormat = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
});
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

// "Sat, Nov 14, 6:00 PM – 10:00 PM", or the full end date for multi-day events.
export function formatEventDate(startsAt, endsAt) {
    const start = new Date(startsAt);
    if (!endsAt) return dateFormat.format(start);

    const end = new Date(endsAt);
    const sameDay = start.toDateString() === end.toDateString();
    return `${dateFormat.format(start)} – ${(sameDay ? timeFormat : dateFormat).format(end)}`;
}

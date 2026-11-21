import tzlookup from "@photostructure/tz-lookup";

const formatters = new Map();

function format(date, timeZone, { withDate, withZone }) {
    const key = `${timeZone}|${withDate}|${withZone}`;
    if (!formatters.has(key)) {
        formatters.set(key, new Intl.DateTimeFormat(undefined, {
            ...(withDate && { weekday: "short", month: "short", day: "numeric" }),
            hour: "numeric",
            minute: "2-digit",
            timeZone,
            ...(withZone && { timeZoneName: "short" }),
        }));
    }
    return formatters.get(key).format(date);
}

function calendarDay(date, timeZone) {
    return date.toLocaleDateString("en-CA", { timeZone });
}

export function formatEventDate({ startsAt, endsAt, latitude, longitude }) {
    const timeZone = tzlookup(latitude, longitude);
    const start = new Date(startsAt);
    if (!endsAt) return format(start, timeZone, { withDate: true, withZone: true });

    const end = new Date(endsAt);
    const sameDay = calendarDay(start, timeZone) === calendarDay(end, timeZone);
    return `${format(start, timeZone, { withDate: true, withZone: false })} – ${format(end, timeZone, { withDate: !sameDay, withZone: true })}`;
}

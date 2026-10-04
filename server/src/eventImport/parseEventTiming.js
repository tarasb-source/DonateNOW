// Turns Google's event date/time text ("Oct 9", "7:00 PM") into real timestamps.
// Google gives local wall-clock times without a year or timezone, so we infer the year
// and interpret the time in the venue's timezone.

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_DAY = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})\b/gi;
const TIME = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi;

// Events whose date already passed by more than this are assumed to be next year's.
const PAST_TOLERANCE_DAYS = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

// Offset of `timeZone` from UTC at `date`, in milliseconds.
function zoneOffsetMs(date, timeZone) {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-US", {
            timeZone,
            hourCycle: "h23",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
            .formatToParts(date)
            .map((p) => [p.type, p.value])
    );
    const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

// Wall-clock time in `timeZone` -> the matching UTC Date (handles DST changes).
export function zonedTimeToDate({ year, month, day, hour, minute }, timeZone) {
    const asUtc = Date.UTC(year, month - 1, day, hour, minute);
    const firstGuess = asUtc - zoneOffsetMs(new Date(asUtc), timeZone);
    return new Date(asUtc - zoneOffsetMs(new Date(firstGuess), timeZone));
}

function localYear(now, timeZone) {
    return Number(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(now));
}

// "Oct 9", "Sat, Oct 9", "Oct 9 – 11", "Oct 30 – Nov 2" -> [{ month, day }, end?]
function parseDates(text) {
    const matches = [...text.matchAll(MONTH_DAY)];
    if (matches.length === 0) return null;

    const toDate = (m) => ({ month: MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()) + 1, day: Number(m[2]) });
    const start = toDate(matches[0]);
    if (matches[1]) return [start, toDate(matches[1])];

    // Same-month range like "Oct 9 – 11".
    const rest = text.slice(matches[0].index + matches[0][0].length);
    const sameMonthEnd = rest.match(/^\s*[–—-]\s*(\d{1,2})\b/);
    return sameMonthEnd ? [start, { month: start.month, day: Number(sameMonthEnd[1]) }] : [start];
}

// "7:00 PM", "7 – 9 PM", "11:30 AM – 1 PM" -> [{ hour, minute }, end?]
function parseTimes(text) {
    const matches = [...(text ?? "").matchAll(TIME)].filter((m) => Number(m[1]) <= 24);
    if (matches.length === 0) return null;

    const raw = matches.slice(0, 2).map((m) => ({
        hour: Number(m[1]),
        minute: Number(m[2] ?? 0),
        meridiem: m[3]?.toLowerCase(),
    }));

    // "7 – 9 PM": the start borrows the end's meridiem, unless that would put it after the end ("11 – 1 PM").
    if (raw.length === 2 && !raw[0].meridiem && raw[1].meridiem) {
        const borrowed = raw[0].hour % 12 <= raw[1].hour % 12 ? raw[1].meridiem : raw[1].meridiem === "pm" ? "am" : "pm";
        raw[0].meridiem = borrowed;
    }

    return raw.map(({ hour, minute, meridiem }) => {
        if (meridiem === "pm" && hour < 12) hour += 12;
        if (meridiem === "am" && hour === 12) hour = 0;
        return { hour, minute };
    });
}

// Returns { startsAt, endsAt, timeKnown } or null when the date can't be understood.
export function parseEventTiming({ date, time }, { timeZone, now = new Date() }) {
    const dates = parseDates(date ?? "");
    if (!dates) return null;

    const times = parseTimes(time);
    // No time listed: noon keeps the date right in every US timezone; the reviewer is told.
    const [startTime, endTime] = times ?? [{ hour: 12, minute: 0 }];

    let year = localYear(now, timeZone);
    let startsAt = zonedTimeToDate({ year, ...dates[0], ...startTime }, timeZone);
    if (startsAt < new Date(now.getTime() - PAST_TOLERANCE_DAYS * DAY_MS)) {
        year += 1;
        startsAt = zonedTimeToDate({ year, ...dates[0], ...startTime }, timeZone);
    }

    let endsAt = null;
    const endDate = dates[1];
    if (endDate || endTime) {
        // A range ending in an earlier month ("Dec 30 – Jan 2") ends the next year.
        const endYear = endDate && endDate.month < dates[0].month ? year + 1 : year;
        endsAt = zonedTimeToDate(
            { year: endYear, ...(endDate ?? dates[0]), ...(endTime ?? { hour: 23, minute: 59 }) },
            timeZone
        );
        // "10 PM – 1 AM" crosses midnight.
        if (endsAt <= startsAt) endsAt = new Date(endsAt.getTime() + DAY_MS);
    }

    return { startsAt, endsAt, timeKnown: Boolean(times) };
}

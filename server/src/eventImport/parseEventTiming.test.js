import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEventTiming, zonedTimeToDate } from "./parseEventTiming.js";

const CHICAGO = "America/Chicago";
const NEW_YORK = "America/New_York";
const now = new Date("2026-10-03T15:00:00Z");
const iso = (d) => d?.toISOString() ?? null;

test("interprets wall-clock time in the venue's timezone", () => {
    const r = parseEventTiming({ date: "Oct 9", time: "7:00 PM" }, { timeZone: CHICAGO, now });
    assert.equal(iso(r.startsAt), "2026-10-10T00:00:00.000Z"); // 7 PM CDT = 00:00 UTC next day
    assert.equal(r.endsAt, null);
    assert.equal(r.timeKnown, true);
});

test("handles DST: November dates use standard time", () => {
    const r = parseEventTiming({ date: "Nov 14", time: "7 PM" }, { timeZone: NEW_YORK, now });
    assert.equal(iso(r.startsAt), "2026-11-15T00:00:00.000Z"); // 7 PM EST = UTC-5
});

test("rolls dates that already passed into next year", () => {
    const r = parseEventTiming({ date: "Jan 15", time: "6:00 PM" }, { timeZone: NEW_YORK, now });
    assert.equal(r.startsAt.getUTCFullYear(), 2027);
});

test("keeps events from the last couple of days in this year", () => {
    const r = parseEventTiming({ date: "Oct 2", time: "6:00 PM" }, { timeZone: NEW_YORK, now });
    assert.equal(r.startsAt.getUTCFullYear(), 2026);
});

test("parses time ranges sharing a meridiem", () => {
    const r = parseEventTiming({ date: "Sat, Oct 10", time: "7 – 9 PM" }, { timeZone: NEW_YORK, now });
    assert.equal(iso(r.startsAt), "2026-10-10T23:00:00.000Z");
    assert.equal(iso(r.endsAt), "2026-10-11T01:00:00.000Z");
});

test("parses ranges crossing noon", () => {
    const r = parseEventTiming({ date: "Oct 10", time: "11 – 1 PM" }, { timeZone: NEW_YORK, now });
    assert.equal(iso(r.startsAt), "2026-10-10T15:00:00.000Z"); // 11 AM EDT
    assert.equal(iso(r.endsAt), "2026-10-10T17:00:00.000Z"); // 1 PM EDT
});

test("parses ranges crossing midnight", () => {
    const r = parseEventTiming({ date: "Oct 10", time: "10 PM – 1 AM" }, { timeZone: NEW_YORK, now });
    assert.equal(iso(r.endsAt), "2026-10-11T05:00:00.000Z"); // 1 AM EDT next day
});

test("parses multi-day ranges", () => {
    const sameMonth = parseEventTiming({ date: "Oct 9 – 11", time: "10:00 AM" }, { timeZone: CHICAGO, now });
    assert.equal(iso(sameMonth.endsAt), "2026-10-12T04:59:00.000Z"); // Oct 11, 11:59 PM CDT

    const acrossMonths = parseEventTiming({ date: "Oct 30 – Nov 2", time: null }, { timeZone: CHICAGO, now });
    assert.equal(acrossMonths.endsAt.getUTCMonth(), 10); // November
});

test("multi-day range crossing new year ends next year", () => {
    const r = parseEventTiming({ date: "Dec 30 – Jan 2", time: null }, { timeZone: NEW_YORK, now });
    assert.equal(r.startsAt.getUTCFullYear(), 2026);
    assert.equal(r.endsAt.getUTCFullYear(), 2027);
});

test("missing time defaults to noon and is flagged", () => {
    const r = parseEventTiming({ date: "Oct 9", time: "" }, { timeZone: CHICAGO, now });
    assert.equal(iso(r.startsAt), "2026-10-09T17:00:00.000Z"); // noon CDT
    assert.equal(r.timeKnown, false);
});

test("12 AM and 12 PM", () => {
    assert.equal(iso(parseEventTiming({ date: "Oct 9", time: "12:00 PM" }, { timeZone: "UTC", now }).startsAt), "2026-10-09T12:00:00.000Z");
    assert.equal(iso(parseEventTiming({ date: "Oct 9", time: "12:30 AM" }, { timeZone: "UTC", now }).startsAt), "2026-10-09T00:30:00.000Z");
});

test("unparseable dates return null", () => {
    assert.equal(parseEventTiming({ date: "Every weekend", time: "7 PM" }, { timeZone: CHICAGO, now }), null);
});

test("zonedTimeToDate across the spring-forward gap stays sane", () => {
    const d = zonedTimeToDate({ year: 2027, month: 3, day: 14, hour: 12, minute: 0 }, NEW_YORK);
    assert.equal(d.toISOString(), "2027-03-14T16:00:00.000Z"); // noon EDT
});

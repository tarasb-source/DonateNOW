// Cheap first-pass filter: Google's "Ukrainian events in X" results include plenty of unrelated
// local events. Anything that passes still needs a human approval before it's published.
const UKRAINE_TERMS = new RegExp(
    [
        "ukrain", "kyiv", "kiev", "lviv", "odesa", "odessa", "kharkiv", "dnipro", "zaporizh",
        "vyshyvan", "pysank", "petrykivk", "hopak", "bandura", "holodomor", "zelensk",
        "slava ukraini", "stand with ukraine", "razom", "nova ukraine", "united help ukraine",
    ].join("|"),
    "i"
);

// Only the title and Google's description count: venues like "Ukrainian Cultural Center" also host
// plenty of unrelated concerts, so a Ukrainian venue name alone isn't enough.
export function isUkraineRelated({ title, type }) {
    return UKRAINE_TERMS.test([title, type].filter(Boolean).join(" "));
}

// Events loaded by seed.js into an empty Event table.
// You can also add events directly in Supabase's Table Editor or with `npm run db:studio -w server`.
//
// Fields:
//   title, organization        required
//   startsAt                   required, ISO date with timezone offset, e.g. "2026-11-14T18:00:00-05:00"
//   endsAt                     optional, same format
//   city, country              required, shown on the card
//   latitude, longitude        required, used for the map and "near me" search.
//                              Find them by right-clicking a spot in Google Maps, or search the place
//                              on https://www.openstreetmap.org and read them from the URL.
//   address, description,      optional
//   category, link
//
// Example:
//   {
//       title: "Benefit Concert for Ukraine",
//       organization: "Example Org",
//       description: "Live music and a silent auction. All proceeds go to medical aid.",
//       category: "Fundraising",
//       link: "https://example.org/concert",
//       startsAt: "2026-11-14T18:00:00-05:00",
//       endsAt: "2026-11-14T22:00:00-05:00",
//       address: "123 Main St",
//       city: "Chicago",
//       country: "USA",
//       latitude: 41.8781,
//       longitude: -87.6298,
//   },
export const events = [
    // Source: https://unitedhelpukraine.org/events-page/ (checked 2026-10-03)
    {
        title: "Meet & Greet the Ukrainian Marine Corps Marathon Team",
        organization: "United Help Ukraine",
        description: "Welcome the Ukrainian soldiers of Team Ukraine as they arrive in the U.S. to run the Marine Corps Marathon.",
        category: "Community",
        link: "https://unitedhelpukraine.org/events/meet-and-greet-the-mcm/",
        startsAt: "2026-10-22T17:00:00-04:00",
        address: "Washington Dulles International Airport, International Arrivals Exit",
        city: "Dulles, VA",
        country: "USA",
        latitude: 38.9531,
        longitude: -77.4565,
    },
];

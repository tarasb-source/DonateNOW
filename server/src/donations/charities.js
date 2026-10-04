// Charities visitors can donate to through Every.org, keyed by their Every.org slug
// (the part after every.org/ on their profile page). Keep in sync with everyOrgSlug in
// client/src/data/organizations.js. Only these can receive donations started on our site.
export const charities = {
    // Filled in once slugs are verified against Every.org's API.
};

export function isDonatable(slug) {
    return Object.hasOwn(charities, slug);
}

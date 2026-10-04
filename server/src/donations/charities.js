// Charities visitors can donate to through Every.org, keyed by their Every.org slug.
// Keep in sync with everyOrgSlug in client/src/data/organizations.js. Only these can
// receive donations started on our site. Each was verified against Every.org's API by EIN.
export const charities = {
    "united-aid-and-logistics-foundation": "Ukraine Aid Operations", // EIN 88-2498776 (legal name: United Aid and Logistics Foundation)
    "razom-for-ukraine": "Razom for Ukraine", // EIN 46-4604398
    "nova-ukraine": "Nova Ukraine", // EIN 46-5335435
    unitedhelpukraine: "United Help Ukraine", // EIN 47-1837509
};

export function isDonatable(slug) {
    return Object.hasOwn(charities, slug);
}

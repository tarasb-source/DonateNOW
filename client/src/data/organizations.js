// everyOrgSlug: the charity's Every.org slug if it accepts donations there (see server/src/donations/charities.js,
// which must list the same slugs). Charities without one only link to their own website.
// image is a file in public/images; imageUrl is a full URL (used for images from Every.org profiles).

// Every.org's image CDN can resize; 3840px originals are far bigger than our cards need.
const everyOrgImage = (path) => `https://res.cloudinary.com/everydotorg/image/upload/f_auto,c_limit,w_1000,q_80/${path}`;
export const organizations = [
    {
        name: 'Charitable foundation "With An Angel On A Shoulder"',
        image: "Angel On A Shoulder.jpg",
        description: "A Ukrainian organization founded in 2017 that provides aid to children and young adults with serious illnesses, orphans, and those in difficult life situations. It also supports social and medical institutions, elderly care, low-income groups, animals, and refugees, with its work intensifying during the war to include support for the military and war-displaced individuals.",
        link: "https://www.angelfund.com.ua/en",
        everyOrgSlug: null,
    },
    {
        name: "Official Website of Ukraine",
        image: "Official website of Ukraine.jpg",
        description: "The initiative of the President of Ukraine The President of Ukraine announced the creation of a transparent platform for donations to Ukraine during the war with Russia. You can choose one of the categories to donate to: Defence and demining Medical aid Rebuilt Ukraine Available options for financial transfer: credit card, bank transfer, PayPal.",
        link: "https://u24.gov.ua/",
        everyOrgSlug: null,
    },
    {
        name: "Children of The Heroes",
        image: "Children of the heroes.png",
        description: "Children of Heroes was founded to help the countless number of Ukrainian children who have suffered the ultimate tragedy: the loss of a parent, or parents, during the ongoing war. The Fund provides the children and their families with comprehensive assistance, led by our team of Family Helpers. Our assistance programs are funded by our partners and donors.",
        link: "https://childrenheroes.org/en/",
        everyOrgSlug: null,
    },
    {
        name: "Ukraine Aid Operations",
        image: "Ukraine aid ops.png",
        description: "An international group of volunteers securing protective aid and life-saving equipment, delivered directly into the hands of Ukrainian defenders. As registered 501(c)(3) nonprofit charity, their donations are deductible to the full extent allowable under IRS regulations. If you want to support their work in Ukraine, you can make a donation on their website. They provide: protective gear (helmets, plates, ear protection), clothing (uniforms, shoes, tactical gloves), technical equipment (drones, night vision devices), medical equipment (IFAKs, Tourniquets), communication devices (starlinks, secure radios), vehicles (ambulances, med-evac cars).",
        link: "https://ukraineaidops.org/",
        everyOrgSlug: "united-aid-and-logistics-foundation",
    },
    {
        name: "Razom for Ukraine",
        imageUrl: everyOrgImage("profile_pics/dnvymhppcntkab6oggmv"),
        description: "A US nonprofit (501(c)(3)) based in New York, contributing to a secure, prosperous, and democratic Ukraine through humanitarian aid, advocacy, and cultural programs.",
        link: "https://www.razomforukraine.org/",
        everyOrgSlug: "razom-for-ukraine",
    },
    {
        name: "Nova Ukraine",
        imageUrl: everyOrgImage("faja_cover/ql0wl9vubbccmrokxile"),
        description: "A US nonprofit (501(c)(3)) based in Palo Alto, California, providing humanitarian aid to Ukraine and raising awareness of Ukrainian culture in the world.",
        link: "https://novaukraine.org/",
        everyOrgSlug: "nova-ukraine",
    },
    {
        name: "United Help Ukraine",
        imageUrl: everyOrgImage("faja_cover/k9tdzrklzddu7ivgkeut"),
        description: "A US nonprofit (501(c)(3)) based in Fairfax, Virginia, helping those at the front lines protecting Ukraine, the families of fallen heroes, and people who had to leave their homes.",
        link: "https://unitedhelpukraine.org/",
        everyOrgSlug: "unitedhelpukraine",
    },
];

import { useState, useEffect } from "react";
import '../CSS/Volunteering.css';

const categories = [
    "All",
    "Remote",
    "Technical",
    "Education",
    "Medical",
    "Legal",
    "Fundraising",
    "Logistics",
    "Psychosocial Support",
    "Mentorship",
    "Professional Skills",
    "Cultural"
];
const _opportunities = [
    {
        id: 1,
        title: "Online English Conversation Partner",
        organization: "ENGin",
        location: "Remote",
        category: "Education",
        tags: "Language, Mentorship, Youth",
        description:"Chat with Ukrainian students for 1 hour per week via video to help them improve English and provide emotional support.",
        link: "https://www.enginprogram.org/"
    },
    {
        id: 2,
        title: "Digital Advocacy and Policy Research",
        organization: "Razom for Ukraine",
        location: "Remote",
        category: "Advocacy",
        tags: "Policy, Research, Communications, Remote",
        description:"",
        link: ""
    },
    {
        id: 3,
        title: "Local Chapter Aid and Logistics Support",
        organization: "Nova Ukraine",
        location: "US-based Chapters / Remote",
        category: "Fundraising/Logistics",
        tags: "Events, Operations, Advocacy, Remote",
        description:
        "Assist US chapters with event planning, fundraising, donor relations, and operational support.",
        link: "https://novaukraine.org/get-involved/"
  },
  {
        id: 4,
        title: "Telemedicine Consultation Volunteer",
        organization: "Telehealth4Ukraine",
        location: "Remote (Worldwide)",
        category: "Medical",
        tags: "Healthcare, Mental Health, Specialist Skills",
        description:
        "Licensed medical professionals providing virtual consultations for Ukrainian patients and doctors.",
        link:
      "https://www.massmed.org/Patient-Care/Health-Topics/Emergency-Preparedness-and-Response/Telehealth-Volunteer-Opportunities-for-Ukraine/"
  },
  {
        id: 5,
        title: "Cyber Security Volunteer (IT-Army)",
        organization: "IT-Army of Ukraine",
        location: "Remote (Worldwide)",
        category: "Technical",
        tags: "Cybersecurity, IT, Digital Activism",
        description:
        "Participate in coordinated digital operations to counter cyber threats against Ukraine.",
        link: "https://supportukrainenow.org/volo"
  },
  {
        id: 6,
        title: "Remote Mental Health & Psychosocial Support",
        organization: "Voices of Children",
        location: "Remote (Worldwide)",
        category: "Psychosocial Support",
        tags: "Children, Mental Health, Trauma",
        description:
        "Provide remote psychological support to families and children affected by the war.",
        link: "https://voices.org.ua/en/i-want-to-help/"
  },
  {
        id: 7,
        title: "Pro-Bono Legal and Administrative Assistance",
        organization: "United Help Ukraine",
        location: "Remote (Worldwide)",
        category: "Legal",
        tags: "Law, Refugees, Admin",
        description:
        "Provide pro-bono legal counsel or assistance for displaced Ukrainians navigating paperwork.",
        link:"https://unitedhelpukraine.org/volunteer"
  },
  {
        id: 8,
        title: "Skilled Crisis Responder (Prep)",
        organization: "American Red Cross",
        location: "US-Based / Remote",
        category: "Professional Skills",
        tags: "GIS, Logistics, Leadership",
        description:
        "Use professional skills to support international crisis response related to Ukraine.",
        link: "https://www.redcross.org/about-us/our-work/international-services/ukraine-crisis.html"
  },
  {
        id: 9,
        title: "3D Printing Production for Supplies",
        organization: "PrintArmy / ДрукАрмія",
        location: "Remote (Worldwide)",
        category: "Technical",
        tags: "3D Printing, Manufacturing",
        description:
        "Use a personal 3D printer to produce components for essential military and humanitarian equipment.",
        link: "https://www.volunteeringukraine.com/en"
  },
  {
        id: 10,
        title: "Virtual Youth Mentorship Programs",
        organization: "Peace Corps Virtual Service",
        location: "Remote (Worldwide)",
        category: "Education",
        tags: "Youth, Business, Leadership",
        description:
        "Co-facilitate virtual English clubs, business classes, or intercultural learning sessions.",
        link:"https://www.peacecorps.gov/ukraine/virtual-service-pilot/"
  },
  {
        id: 11,
        title: "Digital Project Development and Strategy",
        organization: "European Youth Parliament",
        location: "Remote (Digital Meetings)",
        category: "Strategy/Development",
        tags: "Innovation, Policy, Planning",
        description:
        "Join digital workshops to brainstorm ideas for Ukraine’s post-war recovery.",
        link: "https://eyp.org/content/uploads/2024/07/call-for-rua.pdf"
  },
  {
        id: 12,
        title: "Event Planning and Cultural Promotion",
        organization: "Razom Connect",
        location: "Remote / US-Based",
        category: "Culture/Events",
        tags: "Arts, Outreach, Social Media",
        description:
        "Support events that promote Ukrainian culture and solidarity.",
        link: "https://www.razomforukraine.org/get-involved/"
  },
  {
        id: 13,
        title: "Medical Supplies Logistics & Warehouse Prep",
        organization: "International Medical Corps / Nova Ukraine",
        location: "US Warehouses",
        category: "Logistics/Medical",
        tags: "Packing, Supplies, Inventory",
        description:
        "Assist with sorting and packing critical medical supplies for shipment.",
        link: "https://internationalmedicalcorps.org/careers/volunteer/"
  },
  {
        id: 14,
        title: "Advocacy for BIPOC Refugees",
        organization: "Coalition to Support Black People in Ukraine",
        location: "Remote",
        category: "Advocacy",
        tags: "Social Justice, Equity, Fundraising",
        description:
        "Support fundraising and awareness campaigns for BIPOC refugees.",
        link: "https://www.gooverseas.com/volunteer-abroad/ukraine"
  },
  {
        id: 15,
        title: "Remote Translation and Interpretation",
        organization: "UNHCR / Red Cross / Razom",
        location: "Remote",
        category: "Language",
        tags: "Ukrainian, Russian, English, Translation",
        description:
        "Provide document translation, website localization, or interpretation for NGOs.",
        link: "https://www.unv.org/tags/ukraine"
  }
];

export default function Volunteering() {
const [opportunities, setOpportunities] = useState(_opportunities);
const [searchTerm, setSearchTerm] = useState("");
const [currentCategory, setCurrentCategory] = useState("All");

useEffect(() =>  {
    filterOpportunities();
}, [searchTerm, currentCategory]);

const filterOpportunities = () => {
    let results = _opportunities;

    if (currentCategory != "All") {
        results = results.filter((opp) => 
        opp.category.toLowerCase().includes(currentCategory.toLowerCase()) ||
        opp.location.toLowerCase().includes(currentCategory.toLowerCase()) ||
        opp.tags.toLowerCase().includes(currentCategory.toLowerCase())
    );
    }

    if (searchTerm.trim() != "") {
        const term = searchTerm.toLowerCase();
        results = results.filter(
            (opp) => opp.title.toLowerCase().includes(term) || opp.organization.toLowerCase().includes(term) 
            || opp.category.toLowerCase().includes(term) || opp.tags.toLowerCase().includes(term) 
            || opp.location.toLowerCase().includes(term)
        );
    }

    setOpportunities(results);
}
    return (
        <div className="opportunities-container">
            <h2>Volunteer Opportunities:</h2>      
            <input
                type="text"
                placeholder="Search by title, org, or tags..."
                onChange={(e) => {setSearchTerm(e.target.value)}}
            />
            <hr/>

            <div className="filter-buttons">
                {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => setCurrentCategory(category)}
                    className={currentCategory === category ? 'active' : ''}
                >
                    {category}
                </button>
                ))}
            </div>

            <hr/>

            <div className="opportunities-list">
                {opportunities.length === 0 ? (
                    <p>No opportunities found matching your criteria.</p>
                ) : (opportunities.map((opp) => (
                    <div key={opp.id} className="opportunity-card">
                    <h3>{opp.title} - {opp.organization}</h3>
                    <p className="location"> Location: {opp.location}</p>
                    <p className="tags"> Tags: {opp.tags}</p>
                    <p>{opp.description}</p>
                    <a href={opp.link} target="_blank" rel="noopener noreferrer">View & Apply</a>
                    </div>
                ))
                )}
            </div>
    </div>
    );
}
import { useState } from "react";
import CategoryFilter from "../components/CategoryFilter.jsx";
import OpportunityCard from "../components/OpportunityCard.jsx";
import { categories, opportunities as allOpportunities } from "../data/opportunities.js";

export default function Volunteering() {
const [searchTerm, setSearchTerm] = useState("");
const [currentCategory, setCurrentCategory] = useState("All");

const filterOpportunities = () => {
    let results = allOpportunities;

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

    return results;
}
const opportunities = filterOpportunities();

    return (
        <div className="mx-auto my-8 flex w-full max-w-[900px] flex-col gap-6 px-4 text-center">
            <h2>Volunteer Opportunities:</h2>      
            <input
                type="text"
                className="w-full rounded-md border-2 border-[#cccccc] px-4 py-3 text-base transition focus:border-brand focus:shadow-[0_0_4px_rgba(6,90,181,0.4)] focus:outline-none"
                placeholder="Search by title, org, or tags..."
                onChange={(e) => {setSearchTerm(e.target.value)}}
            />
            <hr className="border-gray-300" />

            <CategoryFilter
                categories={categories}
                current={currentCategory}
                onChange={setCurrentCategory}
            />

            <hr className="border-gray-300" />

            <div className="flex flex-col gap-6 md:grid md:grid-cols-2">
                {opportunities.length === 0 ? (
                    <p>No opportunities found matching your criteria.</p>
                ) : (opportunities.map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={opp} />
                ))
                )}
            </div>
    </div>
    );
}

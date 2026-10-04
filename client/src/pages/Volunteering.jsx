import { useState } from "react";
import CategoryFilter from "../components/CategoryFilter.jsx";
import OpportunityCard from "../components/OpportunityCard.jsx";
import { categories } from "../data/categories.js";
import { useOpportunities } from "../hooks/useOpportunities.js";

export default function Volunteering() {
const [searchTerm, setSearchTerm] = useState("");
const [currentCategory, setCurrentCategory] = useState("All");
const { opportunities, loading, error } = useOpportunities({ search: searchTerm, category: currentCategory });

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

            {error ? (
                <p className="text-red-700">Couldn't load opportunities. Please try again later.</p>
            ) : (
            <div className={`flex flex-col gap-6 transition-opacity md:grid md:grid-cols-2 ${loading ? "opacity-50" : ""}`}>
                {!loading && opportunities.length === 0 ? (
                    <p>No opportunities found matching your criteria.</p>
                ) : (opportunities.map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={opp} />
                ))
                )}
            </div>
            )}
    </div>
    );
}

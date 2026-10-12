import { Link } from "react-router-dom";
import Page from "../components/ui/Page.jsx";
import News from "../components/News.jsx";
import { getDonationStats } from "../api/donations.js";
import { useFetch } from "../hooks/useFetch.js";
import { formatUsd } from "../lib/formatCurrency.js";
import { buttonStyles } from "../components/ui/buttonStyles.js";

export default function Home() { 
const { data: stats } = useFetch("donation-stats", getDonationStats);

    return (
        <>
        <div className="flex justify-center bg-linear-to-b from-ua-blue from-[51.289%] to-ua-yellow to-[48%]">
            <img
                className="block h-auto max-h-[45vh] w-full sm:max-h-[85vh] sm:w-3/5"
                src={`${import.meta.env.BASE_URL}images/Donate NOW logo.png`}
                alt="Donate NOW logo"
            />
        </div>
        <Page>
            <h2>Who we are?</h2>
            <p className="w-full text-center">DonateNOW is dedicated to providing immediate assistance to those affected by the crisis in Ukraine. Our mission is to mobilize resources and support for humanitarian aid, medical supplies, and essential services to help alleviate the suffering of individuals and communities impacted by the conflict.</p>

            {stats && (
                <div className="m-4 rounded-lg border-4 border-black p-6 text-center">
                    <h2>Raised through DonateNOW:</h2>
                    <span className="text-[30px] font-bold">{formatUsd(stats.totalRaised)}</span>
                    <p className="mt-1 text-gray-600">
                        {stats.donationCount === 0
                            ? "Be the first to give!"
                            : `from ${stats.donationCount} donation${stats.donationCount === 1 ? "" : "s"}`}
                    </p>
                </div>
            )}
            <p className="w-full text-center">Want to get involved, click below</p>
            <img
                className="mb-2 size-[75px] self-center"
                src={`${import.meta.env.BASE_URL}images/Arrow Down.png`}
                alt="Arrow Down"
            />
            <Link to="/donate" className={buttonStyles()}>
                Help Ukraine Now!
            </Link>
            <News />
        </Page>
        </> 
    );
}

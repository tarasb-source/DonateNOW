import { Link } from "react-router-dom";
import Page from "../components/ui/Page.jsx";
import News from "../components/News.jsx";
import { getDonationStats } from "../api/donations.js";
import { useFetch } from "../hooks/useFetch.js";
import { formatUsd } from "../lib/formatCurrency.js";
import { buttonStyles } from "../components/ui/buttonStyles.js";

const GOAL_USD = 10535;

export default function Home() {
const { data: stats } = useFetch("donation-stats", getDonationStats);

    return (
        <>
        <div className="flex justify-center bg-linear-to-b from-[#016ebb] from-55% to-[#fed706] to-45%">
            <img
                className="block h-auto max-h-[45vh] w-full sm:max-h-[85vh] sm:w-3/5"
                src={`${import.meta.env.BASE_URL}images/Donate NOW logo.png`}
                alt="Donate NOW logo"
            />
        </div>
        <Page>
            <h2>Who we are?</h2>
            <p className="w-full text-center">DonateNOW is dedicated to providing immediate assistance to those affected by the crisis in Ukraine. Our mission is to mobilize resources and support for humanitarian aid, medical supplies, and essential services to help alleviate the suffering of individuals and communities impacted by the conflict.</p>

            {stats && (() => {
                const raised = stats.totalRaised;
                const remaining = Math.max(GOAL_USD - raised, 0);
                const progress = Math.min(raised / GOAL_USD, 1);
                const barWidth = Math.max(progress * 100, 10);
                const reached = raised >= GOAL_USD;

                return (
                    <div className="m-4 w-full max-w-md rounded-2xl bg-sunflower p-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                        <h2>{reached ? "Goal reached! 🎉" : "Help us reach our goal"}</h2>
                        <span className="text-[30px] font-black">
                            {reached ? formatUsd(raised) : `${formatUsd(remaining)} left`}
                        </span>
                        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/60">
                            <div
                                className="h-full rounded-full bg-marine transition-[width] duration-500"
                                style={{ width: `${barWidth}%` }}
                            />
                        </div>
                        <p className="mt-2 font-bold text-black/70">
                            {stats.donationCount === 0
                                ? `Goal: ${formatUsd(GOAL_USD)}`
                                : `${formatUsd(raised)} raised from ${stats.donationCount} donation${stats.donationCount === 1 ? "" : "s"} · Goal: ${formatUsd(GOAL_USD)}`}
                        </p>
                    </div>
                );
            })()}
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

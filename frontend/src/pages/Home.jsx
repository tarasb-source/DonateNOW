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
        <div className="flex justify-center bg-linear-to-b from-[#016ebb] from-[51.27%] to-[#fed706] to-[48.73%]">
            <img
                className="block h-auto max-h-[45vh] w-full sm:max-h-[85vh] sm:w-3/5"
                src={`${import.meta.env.BASE_URL}images/Donate NOW logo.png`}
                alt="Donate NOW logo"
            />
        </div>
        <Page>
            <section className="flex w-full flex-col items-center gap-2">
                <h2>Who we are?</h2>
                <p className="w-full max-w-2xl text-center text-black/80">DonateNOW is dedicated to providing immediate assistance to those affected by the crisis in Ukraine. Our mission is to mobilize resources and support for humanitarian aid, medical supplies, and essential services to help alleviate the suffering of individuals and communities impacted by the conflict.</p>
            </section>

            {stats && (() => {
                const raised = stats.totalRaised;
                const remaining = Math.max(GOAL_USD - raised, 0);
                const progress = Math.min(raised / GOAL_USD, 1);
                const barWidth = Math.max(progress * 100, 10);
                const reached = raised >= GOAL_USD;

                return (
                    <div className="mt-8 w-full max-w-md rounded-2xl bg-[#fed706] p-7 text-center shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
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

            <section className="mt-10 flex w-full flex-col items-center gap-4">
                <p className="text-xl font-bold">Want to get involved?</p>
                <Link to="/donate" className={buttonStyles("primary", "lg")}>
                    Help Ukraine Now!
                </Link>
            </section>

            <div className="mt-12 w-full">
                <News />
            </div>
        </Page>
        </>
    );
}

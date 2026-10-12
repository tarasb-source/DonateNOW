import { Link } from "react-router-dom";
import Page from "../components/ui/Page.jsx";
import { buttonStyles } from "../components/ui/buttonStyles.js";

// Every.org sends donors here after a successful donation.
export default function DonateThankYou() {
    return (
        <Page title="Thank you! 💙💛">
            <p className="w-full max-w-2xl text-center">
                Your donation was completed on Every.org and is on its way to the organization you chose.
                Every.org will email you a receipt for your records.
            </p>
            <p className="w-full max-w-2xl text-center">Want to do even more?</p>
            <div className="flex flex-wrap justify-center gap-3">
                <Link to="/volunteering" className={buttonStyles()}>Find volunteer opportunities</Link>
                <Link to="/events" className={buttonStyles("success")}>Attend an event</Link>
            </div>
        </Page>
    );
}

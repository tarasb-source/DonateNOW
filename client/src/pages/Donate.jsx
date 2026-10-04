import { useState } from "react";
import Page from "../components/ui/Page.jsx";
import DonateMenu from "../components/DonateMenu.jsx";
import { buttonStyles } from "../components/ui/buttonStyles.js";
import { organizations } from "../data/organizations.js";

export default function Donate() { 
const [openMenu, setMenuOpen] = useState(false);

    return (
        <Page title="Donate here!" className="sm:px-12 sm:pb-12">
            <button
                className={`${buttonStyles("primary", "lg")} mx-2`}
                onClick={() => setMenuOpen(true)}
            >
                Donate menu
            </button>

            <div className="flex w-full flex-col gap-2">
                <h2>Donation Methods</h2>
                <p>Your support can make a difference. Choose a donation method below:</p>
                <ul className="list-decimal pl-6">
                    <li>Online Donation: Use our secure online platform to make a one-time or recurring donation.</li>
                    <li>Bank Transfer: Transfer funds directly to our bank account. Contact us for details.</li>
                    <li>Mail a Check: Send a check payable to "DonateNOW" to our mailing address.</li>
                    <li>In-Person Donation: Visit our office to make a donation in person.</li>
                </ul>
                <h3 className="text-center">Here is the list of official organizations that need your help:</h3>
                <img
                    className="size-[75px] self-center"
                    src={`${import.meta.env.BASE_URL}images/Arrow Down.png`}
                    alt="Arrow Down"
                />
                <ol className="list-decimal pl-6 marker:font-bold">
                    {organizations.map((org, i) => (
                        <li key={org.name} className={`my-5 mb-8 px-1.5 pb-1.5 ${i % 2 === 0 ? "text-left" : "text-right"}`}>
                            <h4 className="text-[1.2rem] font-[650]">{org.name}</h4>
                            <img
                                className="inline-block h-auto w-[350px] max-w-full rounded-lg object-cover sm:w-[500px]"
                                src={`${import.meta.env.BASE_URL}images/${org.image}`}
                                alt={org.name}
                            />
                            <h4 className="mt-2">About the organization:</h4>
                            <p>{org.description}</p>
                            <a
                                href={org.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${buttonStyles("success", "sm")} mt-4`}
                            >
                                Visit official website
                            </a>
                        </li>
                    ))}
                </ol>
            </div>
            <p>Thank you for your support!</p>

            { openMenu && (
                <DonateMenu
                    closeMenu={() => setMenuOpen(false)}
                />
            )}
        </Page>
    );
}

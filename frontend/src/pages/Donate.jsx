import { useState } from "react";
import Page from "../components/ui/Page.jsx";
import DonateDialog from "../components/DonateDialog.jsx";
import { buttonStyles } from "../components/ui/buttonStyles.js";
import { organizations } from "../data/organizations.js";

const donatable = organizations.filter((org) => org.everyOrgSlug);

const panelBackgrounds = ["bg-jasmine/40", "bg-azure/10"];

export default function Donate() {
// Every.org slug of the charity the dialog opens with, or null when closed.
const [dialogSlug, setDialogSlug] = useState(null);

    return (
        <Page title="Donate here!" className="mt-[30px] sm:px-12 sm:pb-12">
            {donatable.length > 0 && (
                <button
                    className={`${buttonStyles("primary", "lg")} mx-2`}
                    onClick={() => setDialogSlug(donatable[0].everyOrgSlug)}
                >
                    Donate now
                </button>
            )}

            <div className="flex w-full flex-col gap-2">
                <h2>How donating works</h2>
                <p>
                    DonateNOW doesn't collect money itself. Your donation goes straight to the organization you choose:
                </p>
                <ul className="list-disc pl-6">
                    <li>
                        <strong>Donate via Every.org:</strong> for organizations listed on{" "}
                        <a href="https://www.every.org" target="_blank" rel="noopener noreferrer" className="font-bold text-azure hover:underline">Every.org</a>,
                        a nonprofit donation platform. Pay by card, PayPal, Venmo, Apple Pay, Google Pay, and more;
                        Every.org sends the funds to the charity and emails you a tax receipt.
                    </li>
                    <li>
                        <strong>Official website:</strong> every organization below also accepts donations directly
                        on its own site.
                    </li>
                </ul>
                <h3 className="text-center">Here is the list of official organizations that need your help:</h3>
                <img
                    className="size-[75px] self-center"
                    src={`${import.meta.env.BASE_URL}images/Arrow Down.png`}
                    alt="Arrow Down"
                />
                <ol className="flex list-none flex-col gap-6 pl-0">
                    {organizations.map((org, i) => (
                        <li
                            key={org.name}
                            className={`flex flex-col items-center gap-6 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)] sm:p-8 md:flex-row ${
                                i % 2 === 1 ? "md:flex-row-reverse" : ""
                            } ${panelBackgrounds[i % panelBackgrounds.length]}`}
                        >
                            <img
                                className="h-auto w-full max-w-[360px] shrink-0 rounded-xl object-cover md:w-2/5"
                                src={org.imageUrl ?? `${import.meta.env.BASE_URL}images/${org.image}`}
                                alt={org.name}
                            />
                            <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
                                <h4 className="text-[1.2rem]">{org.name}</h4>
                                <p>{org.description}</p>
                                <div className="mt-2 flex flex-wrap justify-center gap-3 md:justify-start">
                                    {org.everyOrgSlug && (
                                        <button
                                            type="button"
                                            onClick={() => setDialogSlug(org.everyOrgSlug)}
                                            className={buttonStyles("primary", "sm")}
                                        >
                                            Donate via Every.org
                                        </button>
                                    )}
                                    <a
                                        href={org.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={buttonStyles("dark", "sm")}
                                    >
                                        Visit official website
                                    </a>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
            <p>Thank you for your support!</p>

            {dialogSlug && (
                <DonateDialog
                    charities={donatable}
                    initialSlug={dialogSlug}
                    onClose={() => setDialogSlug(null)}
                />
            )}
        </Page>
    );
}

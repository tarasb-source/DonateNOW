import { useState } from "react";
import Page from "../components/ui/Page.jsx";
import DonateDialog from "../components/DonateDialog.jsx";
import { buttonStyles } from "../components/ui/buttonStyles.js";
import { organizations } from "../data/organizations.js";

const donatable = organizations.filter((org) => org.everyOrgSlug);

export default function Donate() { 
// Every.org slug of the charity the dialog opens with, or null when closed.
const [dialogSlug, setDialogSlug] = useState(null);

    return (
        <Page title="Donate here!" className="sm:px-12 sm:pb-12">
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
                        <a href="https://www.every.org" target="_blank" rel="noopener noreferrer" className="text-brand underline">Every.org</a>,
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
                            <div className={`mt-4 flex flex-wrap gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
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
                                    className={buttonStyles("success", "sm")}
                                >
                                    Visit official website
                                </a>
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

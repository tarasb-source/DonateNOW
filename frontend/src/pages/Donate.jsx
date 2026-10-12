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
                        <a href="https://www.every.org" target="_blank" rel="noopener noreferrer" className="font-bold text-azure underline">Every.org</a>,
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
                <ol className="flex list-none flex-col gap-8 pl-0">
                    {organizations.map((org) => (
                        <li key={org.name} className="border-[3px] border-black bg-white p-5 text-left shadow-[6px_6px_0_0_#000] sm:p-7">
                            <h4 className="text-[1.2rem]">{org.name}</h4>
                            <img
                                className="h-auto w-full max-w-[500px] object-cover"
                                src={org.imageUrl ?? `${import.meta.env.BASE_URL}images/${org.image}`}
                                alt={org.name}
                            />
                            <h4 className="mt-3">About the organization:</h4>
                            <p>{org.description}</p>
                            <div className="mt-4 flex flex-wrap gap-3">
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

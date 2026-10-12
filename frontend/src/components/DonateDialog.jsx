import { useEffect, useState } from "react";
import { startDonation } from "../api/donations.js";
import { buttonStyles } from "./ui/buttonStyles.js";

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

// Collects charity/amount/frequency, then hands the donor off to Every.org to pay.
export default function DonateDialog({ charities, initialSlug, onClose }) {
    const [slug, setSlug] = useState(initialSlug ?? charities[0]?.everyOrgSlug);
    const [amount, setAmount] = useState(25);
    const [customAmount, setCustomAmount] = useState("");
    const [frequency, setFrequency] = useState("ONCE");
    const [status, setStatus] = useState("idle"); // idle | redirecting | error
    const [error, setError] = useState("");

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const chosenAmount = customAmount ? Number(customAmount) : amount;
    const charity = charities.find((c) => c.everyOrgSlug === slug);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!(chosenAmount >= 1)) {
            setError("Please enter an amount of at least $1.");
            setStatus("error");
            return;
        }
        setStatus("redirecting");
        try {
            const { url } = await startDonation({ nonprofitSlug: slug, amount: chosenAmount, frequency });
            window.location.assign(url);
        } catch (err) {
            setError(err.message);
            setStatus("error");
        }
    }

    const toggleStyles = (active) =>
        `flex-1 cursor-pointer rounded-md px-4 py-2 transition ${active ? "bg-brand text-white" : "bg-[#e7e7e7] hover:bg-[#d0d0d0]"}`;

    return (
        <div className="fixed inset-0 z-100 bg-black/45" onClick={onClose}>
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="donate-dialog-title"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
                className="fixed top-1/2 left-1/2 z-110 flex max-h-[95vh] w-[95%] max-w-[500px] -translate-1/2 flex-col gap-4 overflow-y-auto rounded-lg bg-white p-5 text-left shadow-md sm:p-7"
            >
                <button
                    type="button"
                    className="absolute top-1 right-4 cursor-pointer p-2 text-2xl"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✖
                </button>

                <h2 id="donate-dialog-title" className="text-center text-2xl">Make a donation</h2>

                <label className="flex flex-col gap-1">
                    <span className="font-semibold">Charity</span>
                    <select
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="rounded-md border-2 border-[#cccccc] px-3 py-2.5 focus:border-brand focus:outline-none"
                    >
                        {charities.map((c) => (
                            <option key={c.everyOrgSlug} value={c.everyOrgSlug}>{c.name}</option>
                        ))}
                    </select>
                </label>

                <div className="flex gap-2" role="group" aria-label="Frequency">
                    <button type="button" className={toggleStyles(frequency === "ONCE")} onClick={() => setFrequency("ONCE")}>One-time</button>
                    <button type="button" className={toggleStyles(frequency === "MONTHLY")} onClick={() => setFrequency("MONTHLY")}>Monthly</button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {PRESET_AMOUNTS.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => { setAmount(preset); setCustomAmount(""); }}
                            className={buttonStyles(!customAmount && amount === preset ? "accent" : "primary", "sm")}
                        >
                            ${preset}
                        </button>
                    ))}
                </div>
                <input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Other amount ($)"
                    aria-label="Other amount in dollars"
                    className="rounded-md border-2 border-[#cccccc] px-3 py-2.5 text-center focus:border-brand focus:outline-none"
                />

                <button
                    type="submit"
                    disabled={status === "redirecting"}
                    className={`${buttonStyles("primary", "lg")} disabled:cursor-wait disabled:opacity-60`}
                >
                    {status === "redirecting"
                        ? "Opening Every.org..."
                        : `Donate ${chosenAmount >= 1 ? `$${chosenAmount}` : ""}${frequency === "MONTHLY" ? " monthly" : ""}`}
                </button>

                {status === "error" && <p className="text-center text-red-700">{error}</p>}

                <p className="text-center text-sm text-gray-600">
                    You'll finish securely on <strong>Every.org</strong>, a nonprofit donation platform. Your gift goes
                    to {charity?.name ?? "the charity"}, and Every.org emails your tax receipt. DonateNOW never handles
                    your payment details.
                </p>
            </form>
        </div>
    );
}

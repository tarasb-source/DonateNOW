import { useState } from "react";
import SuccessMessage from "./ui/SuccessMessage.jsx";
import { buttonStyles } from "./ui/buttonStyles.js";

export default function DonateMenu({ closeMenu }) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();

    if (!selectedAmount || selectedAmount <= 0) {
      return;
    }

    const old = Number(localStorage.getItem("moneyRaised")) || 12500;
    localStorage.setItem("moneyRaised", old + selectedAmount);

    setSubmitted(true);
    setSelectedAmount(null);
    e.target.reset();
  }

  function handlePresetClick(amount) {
    setSelectedAmount(amount);
    setSubmitted(false);
  }

  function handleCustomChange(e) {
    setSelectedAmount(Number(e.target.value));
    setSubmitted(false);
  }

  return (
    <div className="fixed inset-0 z-100 bg-black/45">
      <form
        className="fixed top-1/2 left-1/2 z-110 grid w-[95%] -translate-1/2 justify-items-center rounded-lg bg-white p-5 shadow-md min-[481px]:w-full min-[481px]:max-w-[90%] min-[481px]:p-7 sm:w-[90%] sm:max-w-[500px]"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="absolute top-1 right-4 cursor-pointer p-2 text-2xl"
          onClick={closeMenu}
          aria-label="Close donate menu"
        >
          ✖
        </button>

        <h2 className="text-center sm:m-5">Select Donation Amount</h2>

        <div className="mt-8 grid grid-cols-2 gap-3 min-[481px]:grid-cols-3 min-[481px]:gap-4 sm:text-[18px]">
          {[500, 200, 100, 50, 20, 10].map((amount) => (
            <button
              key={amount}
              type="button"
              className={buttonStyles(selectedAmount === amount ? "accent" : "primary", "lg")}
              onClick={() => handlePresetClick(amount)}
            >
              {amount} $
            </button>
          ))}

          <input
            className="col-span-full mt-2 w-full rounded-sm border border-gray-300 p-3 text-center placeholder:text-gray-500"
            type="number"
            placeholder="Enter custom amount $"
            onChange={handleCustomChange}
          />
        </div>

        {selectedAmount && (
          <p className="mt-4 font-medium">
            Selected: {selectedAmount} $
          </p>
        )}

        <button type="submit" className={`${buttonStyles()} mt-4 w-full min-[481px]:w-auto`}>
          Confirm donation?
        </button>

        {submitted && (
          <SuccessMessage>
            Your donation was successfully submitted! 🎉
            <br />
            Thank you for your help!
          </SuccessMessage>
        )}
      </form>
    </div>
  );
}

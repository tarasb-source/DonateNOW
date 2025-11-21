import { useState } from "react";
import '../CSS/Donate.css';

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
    <div className="donate-menu-container">
      <form className="donate-menu" onSubmit={handleSubmit}>
        <button
          type="button"
          className="close-donate-menu"
          onClick={closeMenu}
        >
          ✖
        </button>

        <h2>Select Donation Amount</h2>

        <div className="donate-buttons-container">
          {[500, 200, 100, 50, 20, 10].map((amount) => (
            <button
              key={amount}
              type="button"
              className="donate-button"
              onClick={() => handlePresetClick(amount)}
            >
              {amount} $
            </button>
          ))}

          <input
            className="donate-custom"
            type="number"
            placeholder="Enter custom amount $"
            onChange={handleCustomChange}
          />
        </div>

        {selectedAmount && (
          <p style={{ marginTop: "1rem", fontWeight: "500" }}>
            Selected: {selectedAmount} $
          </p>
        )}

        <button type="submit" className="submit-button">
          Confirm donation?
        </button>

        {submitted && (
          <p className="submit-msg">
            Your donation was successfully submitted! 🎉
            <br />
            Thank you for your help!
          </p>
        )}
      </form>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import News from '../components/News.jsx';
import '../CSS/Donate.css';

export default function Home() { 
const [moneyRaised, setMoneyRaised] = useState(() => {
  return Number(localStorage.getItem("moneyRaised")) || 12500;
});

useEffect(() => {
  localStorage.setItem("moneyRaised", moneyRaised);
}, [moneyRaised]);

    return (
        <>
        <div className="banner-background">
        <img
          className="donateNOW-logo"
          src={`${import.meta.env.BASE_URL}images/Donate NOW logo.png`}
          alt="Donate NOW logo"
        />
        </div>
        <div className="page-content home-page">
                <div className="page-content">
                <h2>Who we are?</h2>
                <p>DonateNOW is dedicated to providing immediate assistance to those affected by the crisis in Ukraine. Our mission is to mobilize resources and support for humanitarian aid, medical supplies, and essential services to help alleviate the suffering of individuals and communities impacted by the conflict.</p>
                
            <div className="money-raised-container">
            <h2>Total Money Raised:</h2>
            <span className="moneyRaised">{moneyRaised} $</span>
            </div>
            <p>Want to get involved, click below</p>
            <img
              className="arrow"
              src={`${import.meta.env.BASE_URL}images/Arrow Down.png`}
              alt="Arrow Down"
            />
            <Link to="/donate">
                <button className="primary-btn">
                Help Ukraine Now!
                </button>
            </Link>
            <br/>
            <News />
            </div>
        </div>
        </> 
    );
}
import { useState } from "react";
import '../CSS/Donate.css';
import DonateMenu from "../components/DonateMenu.jsx";

export default function Donate() { 
const [openMenu, setMenuOpen] = useState(false);

    return (
        <div className="page-content donate-page">
            <h1>Donate here!</h1>
            <div className="donate-header">
            <button
                className="donate-button"
                onClick={() => setMenuOpen(true)}
                >
                Donate menu</button>
                
            </div>
                <div className="donate-info">
                <h2>Donation Methods</h2>
            <p>Your support can make a difference. Choose a donation method below:</p>
            <ul>
                <li>Online Donation: Use our secure online platform to make a one-time or recurring donation.</li>
                <li>Bank Transfer: Transfer funds directly to our bank account. Contact us for details.</li>
                <li>Mail a Check: Send a check payable to "DonateNOW" to our mailing address.</li>
                <li>In-Person Donation: Visit our office to make a donation in person.</li>
            </ul>
                <h3>Here is the list of official organizations that need your help:</h3>
                <img
                    className="arrow"
                    src={`${import.meta.env.BASE_URL}images/Arrow Down.png`}
                    alt="Arrow Down"
                />
                <ul className="organization-list">
                <li class="org-block-left org-block">
                <h4 className="organization">Charitable foundation "With An Angel On A Shoulder"</h4>
                    <img
                        className="charity-img"
                        src={`${import.meta.env.BASE_URL}images/Angel On A Shoulder.jpg`}
                        alt='Charitable foundation "With An Angel On A Shoulder"'
                    />
                    <h4>About the organization:</h4>
                    <p>A Ukrainian organization founded in 2017 that provides aid to children and young adults with serious illnesses, orphans, 
                        and those in difficult life situations. It also supports social and medical institutions, elderly care, low-income groups, 
                        animals, and refugees, with its work intensifying during the war 
                        to include support for the military and war-displaced individuals.
                        </p>
                    <a 
                        href="https://www.angelfund.com.ua/en" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        >
                        <button className="visit-btn">Visit official website</button>
                    </a>
                </li>
                <li className="org-block-right org-block">
                <h4 className="organization-right">Official Website of Ukraine</h4>
                    <img
                        className="charity-img"
                        src={`${import.meta.env.BASE_URL}images/Official website of Ukraine.jpg`}
                        alt="Official Website of Ukraine"
                    />
                    <h4>About the organization:</h4>
                    <p>The initiative of the President of Ukraine The President of Ukraine announced the creation 
                        of a transparent platform for donations to Ukraine during the war with Russia. 
                        You can choose one of the categories to donate to: Defence and demining Medical aid 
                        Rebuilt Ukraine Available options for financial transfer: credit card, bank transfer, PayPal.</p>
                    <a 
                        href="https://www.angelfund.com.ua/en" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        >
                        <button className="visit-btn">Visit official website</button>
                    </a>
                </li>    
                <li className="org-block-left org-block">
                <h4 className="organization">Children of The Heroes</h4>
                    <img
                        className="charity-img"
                        src={`${import.meta.env.BASE_URL}images/Children of the heroes.png`}
                        alt='Charitable foundation "Children of the Heroes"'
                    />
                    <h4>About the organization:</h4>
                    <p>
                        Children of Heroes was founded to help the countless number of Ukrainian children 
                        who have suffered the ultimate tragedy: the loss of a parent, or parents, during the ongoing war. 
                        The Fund provides the children and their families with comprehensive assistance, 
                        led by our team of Family Helpers. Our assistance programs are funded by our partners and donors.
                    </p>
                    <a 
                        href="https://childrenheroes.org/en/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        >
                        <button className="visit-btn">Visit official website</button>
                    </a>
                </li>
                <li className="org-block-right org-block">
                <h4 className="organization">Ukraine Aid Operations</h4>
                <img
                    className="charity-img"
                    src={`${import.meta.env.BASE_URL}images/Ukraine aid ops.png`}
                    alt="Ukraine Aid Operations"
                />
                    <h4>About the organization:</h4>
                    <p>
                        An international group of volunteers securing protective aid and life-saving equipment, 
                        delivered directly into the hands of Ukrainian defenders.
                        As registered 501(c)(3) nonprofit charity, their donations are deductible to 
                        the full extent allowable under IRS regulations. If you want to support their work in Ukraine, 
                        you can make a donation on their website. They provide: protective gear (helmets, plates, ear protection),
                        clothing (uniforms, shoes, tactical gloves), technical equipment (drones, night vision devices),
                        medical equipment (IFAKs, Tourniquets), communication devices (starlinks, secure radios),
                        vehicles (ambulances, med-evac cars).
                    </p>
                    <a 
                        href="https://ukraineaidops.org/?srsltid=AfmBOoqkcdjqH54S4yHKub6Vko_nEi_x559X34Y3XTmK0JNd0n_KERYS" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        >
                        <button className="visit-btn">Visit official website</button>
                    </a>
                </li>
                </ul>
                    
            </div>
            <p>Thank you for your support!</p>

            { openMenu && (
                <DonateMenu
                    closeMenu={() => setMenuOpen(false)}
                />
            )}
        </div>
    );
}

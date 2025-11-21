import { Link } from "react-router-dom";
import '../CSS/About.css';

export default function About() { 
   
    return (
        <div className="page-content about-us-page">
            <h1>About Us</h1>
            <h2>Who we are?</h2>
            <p>DonateNOW is dedicated to providing immediate assistance to those affected by the crisis in Ukraine. Our mission is to mobilize resources and support for humanitarian aid, medical supplies, and essential services to help alleviate the suffering of individuals and communities impacted by the conflict.</p>
            <h2>What do we do?</h2>
            <p>We believe in the power of collective action and the importance of standing in solidarity with those in need. Through our platform, we aim to connect donors, volunteers, and organizations to create a network of support that can make a meaningful difference in the lives of those affected by the crisis.</p>
            <h2>Join us</h2>
            <p>Join us in our efforts to provide relief and support to Ukraine. Together, we can make a positive impact and help rebuild lives torn apart by conflict.</p>
            <Link to="/volunteering"><button className="primary-btn">Find volunteer opportunities</button></Link>
        </div>
    );
}

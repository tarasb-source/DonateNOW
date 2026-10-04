import { Link } from 'react-router-dom';
import '../CSS/Footer.css';

export default function Footer() { 
   
    return (
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} DonateNOW. All rights reserved.</p>
            <Link to="/about">About Us</Link> |
            <Link to="/contact"> Contact Us</Link> 
        </footer>
    );
}

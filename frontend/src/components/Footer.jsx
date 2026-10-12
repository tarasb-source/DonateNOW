import { Link } from 'react-router-dom';

const linkStyles = "mx-2.5 font-bold text-white hover:text-sunflower";

export default function Footer() {

    return (
        <footer className="bg-copperwood py-10 text-center text-sm font-bold text-white">
            <p>&copy; {new Date().getFullYear()} DonateNOW. All rights reserved.</p>
            <Link to="/about" className={linkStyles}>About Us</Link> |
            <Link to="/contact" className={linkStyles}>Contact Us</Link>
        </footer>
    );
}

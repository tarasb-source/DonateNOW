import { Link } from 'react-router-dom';

const linkStyles = "mx-2.5 text-white hover:underline hover:opacity-80";

export default function Footer() { 
   
    return (
        <footer className="border-t border-[#dbdbdb] bg-brand py-10 text-center text-sm font-[480] text-white">
            <p>&copy; {new Date().getFullYear()} DonateNOW. All rights reserved.</p>
            <Link to="/about" className={linkStyles}>About Us</Link> |
            <Link to="/contact" className={linkStyles}>Contact Us</Link> 
        </footer>
    );
}

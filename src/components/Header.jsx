import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
        <header>
            <div id="header-wrapper" className="header-wrapper">
                <Link to="/">
                    <img
                        className="site-logo"
                        src={`${import.meta.env.BASE_URL}images/Logo.png`}
                        alt="donateNOW Logo"
                    />
                </Link>

                <nav className="nav-links">
                    <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/donate" onClick={() => setMenuOpen(false)}>Donate</Link>
                    <Link to="/volunteering" onClick={() => setMenuOpen(false)}>Volunteering</Link>
                    <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
                    <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link> 
                </nav>

                <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    ☰
                </button>
            </div>

            
        </header>
        {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)}></div>}

                <nav className={`side-menu ${menuOpen ? 'open' : ''}`}>
                    <button className="close-btn" onClick={() => setMenuOpen(false)}>✖</button>

                        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                        <Link to="/donate" onClick={() => setMenuOpen(false)}>Donate</Link>
                        <Link to="/volunteering" onClick={() => setMenuOpen(false)}>Volunteering</Link>
                        <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
                        <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link> 
                </nav> 
        </>
    );
}
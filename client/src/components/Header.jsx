import { Link } from 'react-router-dom';
import { useState } from 'react';

const links = [
    { to: "/", label: "Home" },
    { to: "/donate", label: "Donate" },
    { to: "/volunteering", label: "Volunteering" },
    { to: "/events", label: "Events" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
];

const linkStyles = "font-medium text-black hover:underline hover:opacity-80";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = links.map(({ to, label }) => (
        <Link key={to} to={to} className={linkStyles} onClick={() => setMenuOpen(false)}>{label}</Link>
    ));

    return (
        <>
        <header className="relative z-50 w-full border-b border-gray-300 py-4">
            <div className="flex w-full items-center justify-between sm:justify-start sm:gap-6 sm:px-8">
                <Link to="/">
                    <img
                        className="size-[75px] rounded-full object-cover"
                        src={`${import.meta.env.BASE_URL}images/Logo.png`}
                        alt="donateNOW Logo"
                    />
                </Link>

                <nav className="hidden gap-6 sm:flex">
                    {navLinks}
                </nav>

                <button
                    className="mr-4 cursor-pointer p-2 text-2xl sm:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Open menu"
                >
                    ☰
                </button>
            </div>
        </header>

        {menuOpen && (
            <div
                className="fixed inset-0 z-90 bg-black/50 backdrop-blur-[2px] sm:hidden"
                onClick={() => setMenuOpen(false)}
            ></div>
        )}

        <nav
            className={`fixed top-0 z-100 flex sm:hidden h-screen w-[150px] flex-col gap-6 bg-white px-6 py-8 shadow-[-2px_0_10px_rgba(0,0,0,0.2)] transition-[right] duration-300 ${menuOpen ? 'right-0' : '-right-[400px]'}`}
        >
            <button
                className="cursor-pointer self-end p-2 text-2xl"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
            >
                ✖
            </button>
            {navLinks}
        </nav>
        </>
    );
}

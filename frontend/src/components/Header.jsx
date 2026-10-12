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

const linkStyles = "px-2 py-1 font-extrabold uppercase tracking-wide text-black transition hover:bg-sunflower";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = links.map(({ to, label }) => (
        <Link key={to} to={to} className={linkStyles} onClick={() => setMenuOpen(false)}>{label}</Link>
    ));

    return (
        <>
        <header className="relative z-50 w-full border-b-[4px] border-black bg-white py-4">
            <div className="flex w-full items-center justify-between sm:justify-start sm:gap-6 sm:px-8">
                <Link to="/">
                    <img
                        className="size-[75px] rounded-full border-[3px] border-black object-cover"
                        src={`${import.meta.env.BASE_URL}images/Logo.png`}
                        alt="donateNOW Logo"
                    />
                </Link>

                <nav className="hidden gap-6 sm:flex">
                    {navLinks}
                </nav>

                <button
                    className="mr-4 cursor-pointer border-[3px] border-black bg-white p-2 text-2xl shadow-[3px_3px_0_0_#000] sm:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Open menu"
                >
                    ☰
                </button>
            </div>
        </header>

        {menuOpen && (
            <div
                className="fixed inset-0 z-90 bg-black/50 sm:hidden"
                onClick={() => setMenuOpen(false)}
            ></div>
        )}

        <nav
            className={`fixed top-0 z-100 flex sm:hidden h-screen w-[180px] flex-col gap-6 border-l-[4px] border-black bg-white px-6 py-8 transition-[right] duration-300 ${menuOpen ? 'right-0' : '-right-[400px]'}`}
        >
            <button
                className="cursor-pointer self-end border-[3px] border-black bg-white p-1 text-xl leading-none"
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

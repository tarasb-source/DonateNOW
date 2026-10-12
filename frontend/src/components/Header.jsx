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

const linkStyles = "rounded-md px-3 py-1.5 font-extrabold uppercase tracking-wide text-black transition hover:bg-sunflower";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = links.map(({ to, label }) => (
        <Link key={to} to={to} className={linkStyles} onClick={() => setMenuOpen(false)}>{label}</Link>
    ));

    return (
        <>
        <header className="relative z-50 w-full bg-white py-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex w-full items-center justify-between lg:justify-start lg:gap-4 lg:px-8">
                <Link to="/">
                    <img
                        className="size-[75px] rounded-full object-cover"
                        src={`${import.meta.env.BASE_URL}images/Logo.png`}
                        alt="donateNOW Logo"
                    />
                </Link>

                <nav className="hidden gap-2 lg:flex">
                    {navLinks}
                </nav>

                <button
                    className="mr-4 cursor-pointer rounded-md p-2 text-2xl hover:bg-jasmine lg:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Open menu"
                >
                    ☰
                </button>
            </div>
        </header>

        {menuOpen && (
            <div
                className="fixed inset-0 z-90 bg-black/50 backdrop-blur-[2px] lg:hidden"
                onClick={() => setMenuOpen(false)}
            ></div>
        )}

        <nav
            className={`fixed top-0 z-100 flex lg:hidden h-screen w-[min(230px,75vw)] sm:w-[min(260px,80vw)] flex-col gap-2 bg-white px-6 py-8 shadow-[-4px_0_16px_rgba(0,0,0,0.15)] transition-[right] duration-300 ${menuOpen ? 'right-0' : '-right-[400px]'}`}
        >
            <button
                className="cursor-pointer self-end rounded-md p-2 text-xl hover:bg-jasmine"
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

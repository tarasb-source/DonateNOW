export default function FilterButtons({ options, current, onChange }) {
    return (
        <div className="flex flex-wrap justify-center gap-2">
            {options.map(({ value, label }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => onChange(value)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-[0.85rem] font-bold uppercase tracking-wide transition sm:px-4 sm:py-2 sm:text-[0.95rem] ${
                        current === value
                            ? "bg-azure text-white"
                            : "bg-jasmine/50 text-black hover:bg-jasmine"
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

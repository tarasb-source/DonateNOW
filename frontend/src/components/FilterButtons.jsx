// A row of buttons where one option is active. Options are { value, label }.
export default function FilterButtons({ options, current, onChange }) {
    return (
        <div className="flex flex-wrap justify-center gap-2">
            {options.map(({ value, label }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => onChange(value)}
                    className={`cursor-pointer border-[3px] border-black px-3 py-1.5 text-[0.85rem] font-extrabold uppercase tracking-wide transition sm:px-4 sm:py-2 sm:text-[0.95rem] ${
                        current === value
                            ? "bg-azure text-white shadow-[3px_3px_0_0_#000]"
                            : "bg-white text-black hover:bg-jasmine"
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

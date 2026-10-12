// A row of pill buttons where one option is active. Options are { value, label }.
export default function FilterButtons({ options, current, onChange }) {
    return (
        <div className="flex flex-wrap justify-center gap-2">
            {options.map(({ value, label }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => onChange(value)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-[0.85rem] transition sm:px-4 sm:py-2 sm:text-[0.95rem] ${
                        current === value
                            ? "bg-brand font-semibold text-white"
                            : "bg-[#e7e7e7] text-black hover:bg-[#d0d0d0]"
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

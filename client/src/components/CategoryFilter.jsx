export default function CategoryFilter({ categories, current, onChange }) {
    return (
        <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onChange(category)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-[0.85rem] transition sm:px-4 sm:py-2 sm:text-[0.95rem] ${
                        current === category
                            ? "bg-brand font-semibold text-white"
                            : "bg-[#e7e7e7] text-black hover:bg-[#d0d0d0]"
                    }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}

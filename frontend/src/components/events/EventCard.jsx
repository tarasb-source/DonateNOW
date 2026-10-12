import { formatEventDate } from "../../lib/formatDate.js";

export default function EventCard({ event, selected, onSelect }) {
    const { id, title, organization, description, category, link, startsAt, endsAt, address, city, country, distanceKm } = event;

    return (
        <article
            id={`event-${id}`}
            onClick={() => onSelect(id)}
            className={`cursor-pointer border-[3px] border-black bg-white p-4 text-left transition sm:px-6 sm:py-5 ${
                selected ? "bg-jasmine shadow-[8px_8px_0_0_#000]" : "shadow-[5px_5px_0_0_#000] hover:shadow-[8px_8px_0_0_#000]"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="m-0 text-xl">{title}</h3>
                {distanceKm !== undefined && (
                    <span className="shrink-0 border-2 border-black bg-sunflower px-2 py-0.5 text-sm font-extrabold">
                        {distanceKm < 1 ? "<1" : Math.round(distanceKm)} km
                    </span>
                )}
            </div>
            <p className="mt-1 text-sm font-bold text-black/60">{organization}{category && ` · ${category}`}</p>
            <p className="mt-2 font-bold">{formatEventDate(startsAt, endsAt)}</p>
            <p>{[address, city, country].filter(Boolean).join(", ")}</p>
            {description && <p className="mt-2 leading-[1.4rem]">{description}</p>}
            {link && (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-block border-b-[3px] border-azure font-extrabold text-azure hover:border-black hover:text-black"
                >
                    Details & Registration
                </a>
            )}
        </article>
    );
}

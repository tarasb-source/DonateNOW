import { formatEventDate } from "../../lib/formatDate.js";

export default function EventCard({ event, selected, onSelect }) {
    const { id, title, organization, description, category, link, startsAt, endsAt, address, city, country, distanceKm } = event;

    return (
        <article
            id={`event-${id}`}
            onClick={() => onSelect(id)}
            className={`cursor-pointer rounded-lg border bg-white p-4 text-left shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)] sm:px-6 sm:py-5 ${
                selected ? "border-brand ring-2 ring-brand/30" : "border-[#dddddd]"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="m-0 text-xl text-brand">{title}</h3>
                {distanceKm !== undefined && (
                    <span className="shrink-0 rounded-full bg-ua-yellow/40 px-2 py-0.5 text-sm font-semibold">
                        {distanceKm < 1 ? "<1" : Math.round(distanceKm)} km
                    </span>
                )}
            </div>
            <p className="mt-1 text-sm text-gray-600">{organization}{category && ` · ${category}`}</p>
            <p className="mt-2 font-bold">{formatEventDate(startsAt, endsAt)}</p>
            <p>{[address, city, country].filter(Boolean).join(", ")}</p>
            {description && <p className="mt-2 leading-[1.4rem]">{description}</p>}
            {link && (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-block font-semibold text-brand hover:underline hover:opacity-85"
                >
                    Details & Registration
                </a>
            )}
        </article>
    );
}

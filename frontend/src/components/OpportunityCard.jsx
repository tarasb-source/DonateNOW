export default function OpportunityCard({ opportunity }) {
    const { title, organization, location, tags, description, link } = opportunity;

    return (
        <div className="rounded-lg border border-[#dddddd] bg-white p-4 text-left shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)] sm:px-6 sm:py-5 [&>p]:my-2 [&>p]:leading-[1.4rem]">
            <h3 className="m-0 text-xl text-brand">{title} - {organization}</h3>
            <p className="font-bold">Location: {location}</p>
            <p>Tags: {tags}</p>
            <p>{description}</p>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-semibold text-brand hover:underline hover:opacity-85"
            >
                View & Apply
            </a>
        </div>
    );
}

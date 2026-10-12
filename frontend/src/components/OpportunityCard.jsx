export default function OpportunityCard({ opportunity }) {
    const { title, organization, location, tags, description, link } = opportunity;

    return (
        <div className="border-[3px] border-black bg-white p-4 text-left shadow-[5px_5px_0_0_#000] transition hover:shadow-[8px_8px_0_0_#000] sm:px-6 sm:py-5 [&>p]:my-2 [&>p]:leading-[1.4rem]">
            <h3 className="m-0 text-xl">{title} - {organization}</h3>
            <p className="font-bold">Location: {location}</p>
            <p>Tags: {tags}</p>
            <p>{description}</p>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block border-b-[3px] border-azure font-extrabold text-azure hover:border-black hover:text-black"
            >
                View & Apply
            </a>
        </div>
    );
}

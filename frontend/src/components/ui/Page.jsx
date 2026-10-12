export default function Page({ title, className = "", children }) {
    return (
        <div className={`flex flex-1 flex-col items-center gap-4 px-8 pt-4 pb-8 ${className}`}>
            {title && (
                <h1 className="relative mb-6 w-full text-center text-[2rem]">
                    {title}
                    <span className="mx-auto mt-2 block h-[6px] w-20 bg-azure" />
                </h1>
            )}
            {children}
        </div>
    );
}

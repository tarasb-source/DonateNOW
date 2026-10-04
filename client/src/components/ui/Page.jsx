export default function Page({ title, className = "", children }) {
    return (
        <div className={`flex flex-1 flex-col items-center gap-4 px-8 pt-4 pb-8 ${className}`}>
            {title && <h1 className="mb-4 w-full text-center text-[2rem]">{title}</h1>}
            {children}
        </div>
    );
}

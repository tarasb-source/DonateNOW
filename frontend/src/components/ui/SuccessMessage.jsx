export default function SuccessMessage({ children }) {
    return (
        <p className="mt-6 border-[3px] border-black bg-sunflower p-4 text-center font-bold shadow-[5px_5px_0_0_#000]">
            {children}
        </p>
    );
}

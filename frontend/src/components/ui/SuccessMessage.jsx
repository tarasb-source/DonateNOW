export default function SuccessMessage({ children }) {
    return (
        <p className="mt-6 rounded-xl bg-sunflower/60 p-4 text-center font-semibold">
            {children}
        </p>
    );
}

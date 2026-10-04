export default function SuccessMessage({ children }) {
    return (
        <p className="mt-6 rounded-[7px] border border-green-600 bg-green-100 p-4 text-center">
            {children}
        </p>
    );
}

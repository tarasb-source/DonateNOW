const base = "inline-block cursor-pointer rounded border-none text-base text-white transition hover:opacity-80";

const variants = {
    primary: "bg-brand",
    accent: "bg-brand-accent",
    success: "bg-success",
};

const sizes = {
    sm: "px-5 py-2.5",
    md: "px-6 py-3",
    lg: "px-6 py-4",
};

// Shared so links can look like buttons without nesting <button> inside <a>.
// Pass variant/size instead of overriding bg-*/p-* classes, which would conflict.
export function buttonStyles(variant = "primary", size = "md") {
    return `${base} ${variants[variant]} ${sizes[size]}`;
}

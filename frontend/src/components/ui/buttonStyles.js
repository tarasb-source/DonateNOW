const base = "inline-block cursor-pointer rounded-full border-none font-bold text-black transition hover:brightness-95 active:brightness-90";

const variants = {
    primary: "bg-azure text-white",
    accent: "bg-sunflower",
    dark: "bg-copperwood text-white",
    white: "bg-white",
};

const sizes = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
};

// Shared so links can look like buttons without nesting <button> inside <a>.
// Pass variant/size instead of overriding bg-*/p-* classes, which would conflict.
export function buttonStyles(variant = "primary", size = "md") {
    return `${base} ${variants[variant]} ${sizes[size]}`;
}

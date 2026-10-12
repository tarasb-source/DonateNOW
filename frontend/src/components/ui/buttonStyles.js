import { brutalPressable } from "./brutalStyles.js";

const base = "inline-block cursor-pointer border-[3px] border-black font-extrabold uppercase tracking-wide text-black";

const variants = {
    primary: "bg-azure text-white",
    accent: "bg-sunflower",
    dark: "bg-copperwood text-white",
    white: "bg-white",
};

const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
};

const shadowSizes = { sm: "sm", md: "md", lg: "lg" };

// Shared so links can look like buttons without nesting <button> inside <a>.
// Pass variant/size instead of overriding bg-*/p-* classes, which would conflict.
export function buttonStyles(variant = "primary", size = "md") {
    return `${base} ${variants[variant]} ${sizes[size]} ${brutalPressable(shadowSizes[size])}`;
}

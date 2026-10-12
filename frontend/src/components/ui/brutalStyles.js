// Flat color + thick black border + hard offset shadow, with a "press into the page"
// effect on hover/active (shadow shrinks, element shifts toward it).
const pressable = {
    sm: "shadow-[3px_3px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    md: "shadow-[5px_5px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0_0_#000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
    lg: "shadow-[8px_8px_0_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0_0_#000] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none",
};

export function brutalPressable(size = "md") {
    return `transition-all duration-150 ${pressable[size]}`;
}

const flat = {
    sm: "shadow-[3px_3px_0_0_#000]",
    md: "shadow-[5px_5px_0_0_#000]",
    lg: "shadow-[8px_8px_0_0_#000]",
};

export function brutalShadow(size = "md") {
    return flat[size];
}

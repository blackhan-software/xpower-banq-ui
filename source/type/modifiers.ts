export type Modifiers = Partial<{
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
}>
export const Modifiers = {
    mask(mods?: Modifiers, mask = 0) {
        if (mods?.altKey) mask |= 0b001;
        if (mods?.ctrlKey) mask |= 0b010;
        if (mods?.shiftKey) mask |= 0b100;
        return mask;
    }
};
export default Modifiers;

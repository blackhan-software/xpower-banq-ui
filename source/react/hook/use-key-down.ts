import { GLOBAL } from "@/constant";
import { Modifiers } from "@/type";
import { useCallback, useEffect } from "react";

export function useKeyDown(
    key: string,
    callback: () => void,
    mods?: Modifiers,
) {
    const my_callback = useCallback(callback, [callback]);
    const mod_mask = Modifiers.mask(mods);
    useEffect(() => {
        const handler = (ev: KeyboardEvent) => {
            if (ev.key !== key) {
                return;
            }
            if (Modifiers.mask(ev) !== mod_mask) {
                return;
            }
            my_callback();
        };
        GLOBAL.addEventListener("keydown", handler);
        return () => {
            GLOBAL.removeEventListener("keydown", handler);
        };
    }, [
        key, mod_mask, my_callback,
    ]);
}
export default useKeyDown;

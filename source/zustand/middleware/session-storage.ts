import { PersistStorage } from "zustand/middleware";
import { polyfill } from "@/function";
polyfill(JSON.parse);

/**
 * @return A JSON storage creator for zustand's
 * persist middleware - uses sessionStorage API.
 */
export const SessionStorage = <
    T, P extends Partial<T> = Partial<T>
>(): PersistStorage<P> => ({
    getItem: (name) => {
        const item = sessionStorage.getItem(name);
        if (typeof item === "string") {
            return JSON.parse(item);
        }
        return null;
    },
    setItem: (name, value) => {
        sessionStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name) => {
        sessionStorage.removeItem(name);
    },
});
export default SessionStorage;

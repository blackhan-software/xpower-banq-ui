import { vi } from "vitest";

export function stubGlobals() {
    vi.stubGlobal("sessionStorage", {
        getItem: () => null, setItem: () => {}, removeItem: () => {},
    });
    vi.stubGlobal("localStorage", {
        getItem: () => null, setItem: () => {}, removeItem: () => {},
    });
    vi.stubGlobal("location", { search: "", hash: "", pathname: "/" });
}

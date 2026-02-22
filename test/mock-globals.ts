import { vi } from "vitest";

export function stubGlobals() {
    vi.stubGlobal("sessionStorage", {
        getItem: () => null, setItem: () => {}, removeItem: () => {},
    });
    vi.stubGlobal("localStorage", {
        getItem: () => null, setItem: () => {}, removeItem: () => {},
    });
    vi.stubGlobal("location", { search: "", hash: "", pathname: "/" });
    if (!(BigInt.prototype as unknown as { toJSON?: unknown }).toJSON) {
        (BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () { return `${this}`; };
    }
}

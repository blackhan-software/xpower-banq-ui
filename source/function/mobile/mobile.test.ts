import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mobile } from "./mobile";

describe("mobile: true", () => {
    beforeAll(() => {
        vi.stubGlobal("navigator", { userAgent: "Mobile" });
    });
    afterAll(() => {
        vi.unstubAllGlobals();
    });
    it("should return true on mobile", () => {
        expect(mobile()).toBe(true);
    });
    it("should return lhs on mobile", () => {
        expect(mobile("mobile")).toBe("mobile");
        expect(mobile("mobile", "desktop")).toBe("mobile");
    });
    vi.unstubAllGlobals();
});
describe("mobile: false", () => {
    beforeAll(() => {
        vi.stubGlobal("navigator", { userAgent: "Desktop" });
    });
    afterAll(() => {
        vi.unstubAllGlobals();
    });
    it("should return false on mobile", () => {
        expect(mobile()).toBe(false);
    });
    it("should return rhs on mobile", () => {
        expect(mobile("mobile")).toBeUndefined();
        expect(mobile("mobile", "desktop")).toBe("desktop");
    });
});

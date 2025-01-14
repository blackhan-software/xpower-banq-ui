import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nomobi } from "./nomobi";

describe("nomobi: false", () => {
    beforeAll(() => {
        vi.stubGlobal("navigator", { userAgent: "Mobile" });
    });
    afterAll(() => {
        vi.unstubAllGlobals();
    });
    it("should return false on mobile", () => {
        expect(nomobi()).toBe(false);
    });
    it("should return rhs on mobile", () => {
        expect(nomobi("mobile")).toBeUndefined();
        expect(nomobi("mobile", "desktop")).toBe("desktop");
    });
});
describe("nomobi: true", () => {
    beforeAll(() => {
        vi.stubGlobal("navigator", { userAgent: "Desktop" });
    });
    afterAll(() => {
        vi.unstubAllGlobals();
    });
    it("should return true on mobile", () => {
        expect(nomobi()).toBe(true);
    });
    it("should return lhs on mobile", () => {
        expect(nomobi("mobile")).toBe("mobile");
        expect(nomobi("mobile", "desktop")).toBe("mobile");
    });
    vi.unstubAllGlobals();
});

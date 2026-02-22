import { describe, expect, it } from "vitest";
import { sessionVersion } from "./session-version";

describe("sessionVersion", () => {
    it("should return a positive integer", () => {
        const version = sessionVersion();
        expect(version).toBeGreaterThan(0);
        expect(Number.isInteger(version)).toBe(true);
    });
    it("should match the current epoch day", () => {
        const expected = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
        expect(sessionVersion()).toBe(expected);
    });
});

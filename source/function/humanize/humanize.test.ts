import { describe, expect, it } from "vitest";
import { humanize } from "./humanize";

describe("humanize", () => {
    it("should return 'a few seconds' for < 45s", () => {
        expect(humanize(10)).toBe("a few seconds");
        expect(humanize(44)).toBe("a few seconds");
    });
    it("should return 'a minute' for < 90s", () => {
        expect(humanize(60)).toBe("a minute");
        expect(humanize(89)).toBe("a minute");
    });
    it("should return 'N minutes' for < 45 min", () => {
        expect(humanize(120)).toBe("2 minutes");
        expect(humanize(600)).toBe("10 minutes");
    });
    it("should return 'an hour' for < 90 min", () => {
        expect(humanize(3600)).toBe("an hour");
    });
    it("should return 'N hours' for < 22 hours", () => {
        expect(humanize(7200)).toBe("2 hours");
    });
    it("should return 'a day' for < 36 hours", () => {
        expect(humanize(86400)).toBe("a day");
    });
    it("should return 'N days' for < 26 days", () => {
        expect(humanize(5 * 86400)).toBe("5 days");
    });
    it("should return 'a month' for < 45 days", () => {
        expect(humanize(30 * 86400)).toBe("a month");
    });
    it("should prefix 'in' for positive relative", () => {
        expect(humanize(10, true)).toBe("in a few seconds");
    });
    it("should suffix 'ago' for negative relative", () => {
        expect(humanize(-10, true)).toBe("a few seconds ago");
    });
});

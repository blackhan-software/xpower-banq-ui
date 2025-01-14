import { fixed } from "./fixed";
import { describe, it, expect } from "vitest";

describe("fixed: digits=0", () => {
    it("should round", () => {
        expect(fixed(0.5, 0, "round")).toBe("1");
        expect(fixed(0.4, 0, "round")).toBe("0");
    });
    it("should round down", () => {
        expect(fixed(0.5, 0, "floor")).toBe("0");
        expect(fixed(0.4, 0, "floor")).toBe("0");
    });
    it("should round up", () => {
        expect(fixed(0.5, 0, "ceil")).toBe("1");
        expect(fixed(0.4, 0, "ceil")).toBe("1");
    });
});
describe("fixed: digits=1", () => {
    it("should round", () => {
        expect(fixed(0.15, 1, "round")).toBe("0.2");
        expect(fixed(0.14, 1, "round")).toBe("0.1");
    });
    it("should round down", () => {
        expect(fixed(0.15, 1, "floor")).toBe("0.1");
        expect(fixed(0.14, 1, "floor")).toBe("0.1");
    });
    it("should round up", () => {
        expect(fixed(0.15, 1, "ceil")).toBe("0.2");
        expect(fixed(0.14, 1, "ceil")).toBe("0.2");
    });
});
describe("fixed: digits=2", () => {
    it("should round", () => {
        expect(fixed(0.125, 2, "round")).toBe("0.13");
        expect(fixed(0.124, 2, "round")).toBe("0.12");
    });
    it("should round down", () => {
        expect(fixed(0.125, 2, "floor")).toBe("0.12");
        expect(fixed(0.124, 2, "floor")).toBe("0.12");
    });
    it("should round up", () => {
        expect(fixed(0.125, 2, "ceil")).toBe("0.13");
        expect(fixed(0.124, 2, "ceil")).toBe("0.13");
    });
});

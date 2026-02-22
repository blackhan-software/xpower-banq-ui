import { describe, expect, it } from "vitest";
import { Cycle } from "./cycle";

describe("Cycle.next", () => {
    it("should return null", () => {
        expect(Cycle.next(null)).toBe(null);
    });
    it("should return null", () => {
        expect(Cycle.next([])).toBe(null);
    });
    it("should return 0", () => {
        expect(Cycle.next([0, 1, 2], 2)).toBe(0);
    });
    it("should return 1", () => {
        expect(Cycle.next([0, 1, 2], 0)).toBe(1);
    });
    it("should return 2", () => {
        expect(Cycle.next([0, 1, 2], 1)).toBe(2);
    });
    it("should return a", () => {
        expect(Cycle.next(["a", "b", "c"], "c")).toBe("a");
    });
    it("should return b", () => {
        expect(Cycle.next(["a", "b", "c"], "a")).toBe("b");
    });
    it("should return c", () => {
        expect(Cycle.next(["a", "b", "c"], "b")).toBe("c");
    });
});
describe("Cycle.prev", () => {
    it("should return null", () => {
        expect(Cycle.prev(null)).toBe(null);
    });
    it("should return null", () => {
        expect(Cycle.prev([])).toBe(null);
    });
    it("should return 0", () => {
        expect(Cycle.prev([0, 1, 2], 1)).toBe(0);
    });
    it("should return 1", () => {
        expect(Cycle.prev([0, 1, 2], 2)).toBe(1);
    });
    it("should return 2", () => {
        expect(Cycle.prev([0, 1, 2], 0)).toBe(2);
    });
    it("should return a", () => {
        expect(Cycle.prev(["a", "b", "c"], "b")).toBe("a");
    });
    it("should return b", () => {
        expect(Cycle.prev(["a", "b", "c"], "c")).toBe("b");
    });
    it("should return c", () => {
        expect(Cycle.prev(["a", "b", "c"], "a")).toBe("c");
    });
});
describe("Cycle.rotate", () => {
    it("should return null", () => {
        expect(Cycle.rotate(null)).toBe(null);
    });
    it("should return []", () => {
        expect(Cycle.rotate([])).toEqual([]);
    });
    it("should return [0, 1, 2]", () => {
        expect(Cycle.rotate([0, 1, 2])).toEqual([0, 1, 2]);
    });
    it("should return [0, 1, 2]", () => {
        expect(Cycle.rotate([0, 1, 2], 0)).toEqual([0, 1, 2]);
    });
    it("should return [1, 2, 0]", () => {
        expect(Cycle.rotate([0, 1, 2], 1)).toEqual([1, 2, 0]);
    });
    it("should return [2, 0, 1]", () => {
        expect(Cycle.rotate([0, 1, 2], 2)).toEqual([2, 0, 1]);
    });
    it("should return [a, b, c]", () => {
        expect(Cycle.rotate(["a", "b", "c"])).toEqual(["a", "b", "c"]);
    });
    it("should return [0, 1, 2]", () => {
        expect(Cycle.rotate(["a", "b", "c"], "a")).toEqual(["a", "b", "c"]);
    });
    it("should return [1, 2, 0]", () => {
        expect(Cycle.rotate(["a", "b", "c"], "b")).toEqual(["b", "c", "a"]);
    });
    it("should return [2, 0, 1]", () => {
        expect(Cycle.rotate(["a", "b", "c"], "c")).toEqual(["c", "a", "b"]);
    });
});

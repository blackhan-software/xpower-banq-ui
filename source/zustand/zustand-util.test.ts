import { describe, expect, it } from "vitest";
import { add } from "./zustand-util";

describe("add", () => {
    it("should append element when not the last", () => {
        const array = ["a", "b"];
        const result = add(array, "c");
        expect(result).toEqual(["a", "b", "c"]);
    });
    it("should return same reference when element is the last", () => {
        const array = ["a", "b"];
        const result = add(array, "b");
        expect(result).toBe(array);
    });
    it("should append to an empty array", () => {
        const array: string[] = [];
        const result = add(array, "x");
        expect(result).toEqual(["x"]);
    });
    it("should not mutate the original array", () => {
        const array = ["a"];
        const result = add(array, "b");
        expect(array).toEqual(["a"]);
        expect(result).toEqual(["a", "b"]);
        expect(result).not.toBe(array);
    });
    it("should append duplicate if not last", () => {
        const array = ["a", "b"];
        const result = add(array, "a");
        expect(result).toEqual(["a", "b", "a"]);
    });
});

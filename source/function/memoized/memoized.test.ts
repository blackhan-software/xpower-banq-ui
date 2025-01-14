import { describe, expect, it } from "vitest";
import { memoized } from "./memoized";

describe("memoized", () => {
    it("should memoize an add-function", () => {
        let counter = 0;
        const add = memoized((a: number, b: number) => {
            counter++;
            return a + b;
        });
        expect(add(1, 2)).toBe(3);
        expect(counter).toBe(1);
        expect(add(1, 2)).toBe(3);
        expect(counter).toBe(1);
        expect(add(2, 3)).toBe(5);
        expect(counter).toBe(2);
    });
    it("should memoize an sub-function", () => {
        let counter = 0;
        const sub = memoized((a: number, b: number) => {
            counter++;
            return a - b;
        });
        expect(sub(2, 1)).toBe(1);
        expect(counter).toBe(1);
        expect(sub(2, 1)).toBe(1);
        expect(counter).toBe(1);
        expect(sub(3, 2)).toBe(1);
        expect(counter).toBe(2);
    });
});

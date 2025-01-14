import { describe, expect, it } from "vitest";
import { omit } from "./omit";

describe('pick', () => {
    const abc = { a: 1, b: 2, c: 3 }
    it("should omit 0 object field", () => {
        expect(omit(abc, [])).toEqual(abc);
        expect(omit(abc, [])).toEqual({
            a: 1, b: 2, c: 3
        });
    });
    it("should pick 1 object field", () => {
        expect(omit(abc, ["a"])).toEqual({
            b: 2, c: 3
        });
    });
    it("should pick 2 object fields", () => {
        expect(omit(abc, ["a", "b"])).toEqual({
            c: 3
        });
    });
    it("should pick 3 object fields", () => {
        expect(omit(abc, ["a", "b", "c"])).toEqual({});
    });
});

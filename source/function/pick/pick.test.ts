import { describe, expect, it } from "vitest";
import { pick } from "../pick/pick";

describe('pick', () => {
    const abc = { a: 1, b: 2, c: 3 }
    it("should pick 0 object field", () => {
        expect(pick(abc, [])).toEqual({});
    });
    it("should pick 1 object field", () => {
        expect(pick(abc, ["a"])).toEqual({
            a: 1
        });
    });
    it("should pick 2 object fields", () => {
        expect(pick(abc, ["a", "b"])).toEqual({
            a: 1, b: 2
        });
    });
    it("should pick 3 object fields", () => {
        expect(pick(abc, ["a", "b", "c"])).toEqual(abc);
        expect(pick(abc, ["a", "b", "c"])).toEqual({
            a: 1, b: 2, c: 3
        });
    });
});

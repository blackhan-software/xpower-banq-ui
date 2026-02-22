import { describe, expect, it } from "vitest";
import { polyfill } from "./polyfill";

describe('polyfill', () => {
    polyfill(JSON.parse);
    it("should polyfill BigInt.toJSON", () => {
        expect(Object.hasOwnProperty.call(
            BigInt.prototype, 'toJSON'
        )).toBeTruthy();
    });
});
describe('polyfill: JSON.stringify', () => {
    polyfill(JSON.parse);
    it("should stringify 1n to '\"1n\"'", () => {
        expect(JSON.stringify(1n)).toEqual('"1n"');
    });
});
describe('polyfill: JSON.parse', () => {
    polyfill(JSON.parse);
    it("should parse '\"1n\"' to 1n", () => {
        expect(JSON.parse('"1n"')).toEqual(1n);
    });
});

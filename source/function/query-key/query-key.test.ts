import { describe, expect, it } from "vitest";
import { queryKey } from "./query-key";

describe("query-key", () => {
    it("should return a hash string", () => {
        expect(queryKey("hello")).toBe("5e918d2");
    });
    it("should return a hash string", () => {
        expect(queryKey("world")).toBe("6c11b92");
    });
    it("should return a hash string", () => {
        expect(queryKey("hello world")).toBe("6aefe2c4");
    });
    it("should return a hash string", () => {
        expect(queryKey("")).toBe("0");
    });
});
describe("query-key with radix", () => {
    it("should return a hash string", () => {
        expect(queryKey("hello", 16)).toBe("5e918d2");
    });
    it("should return a hash string", () => {
        expect(queryKey("world", 16)).toBe("6c11b92");
    });
    it("should return a hash string", () => {
        expect(queryKey("hello world", 16)).toBe("6aefe2c4");
    });
    it("should return a hash string", () => {
        expect(queryKey("", 16)).toBe("0");
    });
    it("should return a hash string", () => {
        expect(queryKey("hello", 2)).toBe("101111010010001100011010010");
    });
    it("should return a hash string", () => {
        expect(queryKey("world", 2)).toBe("110110000010001101110010010");
    });
    it("should return a hash string", () => {
        expect(queryKey("hello world", 2)).toBe("1101010111011111110001011000100");
    });
    it("should return a hash string", () => {
        expect(queryKey("", 2)).toBe("0");
    });
    it("should return a hash string", () => {
        expect(queryKey("hello", 36)).toBe("1n1e4y");
    });
    it("should return a hash string", () => {
        expect(queryKey("world", 36)).toBe("1vgtci");
    });
    it("should return a hash string", () => {
        expect(queryKey("hello world", 36)).toBe("to5x38");
    });
    it("should return a hash string", () => {
        expect(queryKey("", 36)).toBe("0");
    });
    it("should throw on invalid radix", () => {
        expect(() => queryKey("hello", 1)).toThrow(RangeError);
    });
    it("should throw on invalid radix", () => {
        expect(() => queryKey("hello", 37)).toThrow(RangeError);
    });
});

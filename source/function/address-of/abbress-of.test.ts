import { describe, expect, it } from "vitest";
import { abbressOf } from "./address";

describe("abbressOf", () => {
    it("should return '0x0' for 0n", () => {
        expect(abbressOf(0n)).toBe("0x0000…0000");
    });
    it("should return '0x1' for 1n", () => {
        expect(abbressOf(1n)).toBe("0x0000…0001");
    });
});

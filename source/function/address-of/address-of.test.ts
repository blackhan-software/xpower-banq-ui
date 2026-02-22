import { describe, expect, it } from "vitest";
import { addressOf } from "./address";

describe("addressOf", () => {
    it("should return '0x0' for 0n", () => {
        expect(addressOf(0n)).toBe(
            "0x0000000000000000000000000000000000000000"
        );
    });
    it("should return '0x1' for 1n", () => {
        expect(addressOf(1n)).toBe(
            "0x0000000000000000000000000000000000000001"
        );
    });
});

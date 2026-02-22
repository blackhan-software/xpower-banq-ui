import { describe, expect, it } from "vitest";
import { Account } from "./account";

describe("Account.of", () => {
    it("should return empty array for empty input", () => {
        expect(Account.of([])).toEqual([]);
    });
    it("should convert a single hex address", () => {
        expect(Account.of(["0x1"])).toEqual([1n]);
    });
    it("should convert multiple hex addresses", () => {
        expect(Account.of(["0xa", "0xb"])).toEqual([10n, 11n]);
    });
    it("should convert a large address", () => {
        const addr = "0x" + "ff".repeat(20);
        const expected = BigInt(addr);
        expect(Account.of([addr])).toEqual([expected]);
    });
});

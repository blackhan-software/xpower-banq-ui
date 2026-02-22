import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { Symbol, Token, Tokens } from "@/type";

describe("Token.amount", () => {
    it("should return 1.0 for default (one full unit)", () => {
        const token = Tokens[Symbol.APOW]; // 18 decimals
        expect(Token.amount(token)).toBe(1);
    });
    it("should convert explicit bigint amount", () => {
        const token = Tokens[Symbol.APOW]; // 18 decimals
        const amount = 5n * 10n ** 18n;
        expect(Token.amount(token, amount)).toBe(5);
    });
    it("should handle 6-decimal tokens", () => {
        const token = Tokens[Symbol.USDC]; // 6 decimals
        expect(Token.amount(token)).toBe(1);
        expect(Token.amount(token, 1_500_000n)).toBe(1.5);
    });
});
describe("Token.big", () => {
    it("should convert amount to bigint", () => {
        const token = Tokens[Symbol.APOW]; // 18 decimals
        expect(Token.big(token, 1.5)).toBe(
            1_500_000_000_000_000_000n
        );
    });
    it("should handle 6-decimal tokens", () => {
        const token = Tokens[Symbol.USDC]; // 6 decimals
        expect(Token.big(token, 2.5)).toBe(2_500_000n);
    });
});
describe("Token.from", () => {
    it("should find token by address", () => {
        const apow = Tokens[Symbol.APOW];
        const found = Token.from(apow.address);
        expect(found.symbol).toBe(Symbol.APOW);
        expect(found.decimals).toBe(18n);
    });
    it("should return NONE fallback for unknown address", () => {
        const addr = "0x0000000000000000000000000000000000000999";
        const found = Token.from(addr);
        expect(found.symbol).toBe(Symbol.NONE);
        expect(found.address).toBe(addr);
    });
    it("should find token by symbol", () => {
        const found = Token.from("APOW" as any);
        expect(found.symbol).toBe(Symbol.APOW);
    });
    it("should return NONE for unknown symbol", () => {
        const found = Token.from("UNKNOWN" as any);
        expect(found.symbol).toBe(Symbol.NONE);
    });
});
describe("Token.unit", () => {
    it("should return 1e18 for 18-decimal token", () => {
        const token = Tokens[Symbol.APOW];
        expect(Token.unit(token)).toBe(1e18);
    });
    it("should return 1e6 for 6-decimal token", () => {
        const token = Tokens[Symbol.USDC];
        expect(Token.unit(token)).toBe(1e6);
    });
    it("should work with address input", () => {
        const token = Tokens[Symbol.USDC];
        expect(Token.unit(token.address)).toBe(1e6);
    });
});

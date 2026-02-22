import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";
import { polyfill } from "@/function/polyfill/polyfill";

stubGlobals();
polyfill(JSON.parse);

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    U224: 2n ** 224n - 1n,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { Mode, Position, Symbol, Tokens } from "@/type";

const APOW_ADDR = Tokens[Symbol.APOW].address;

describe("Position.from", () => {
    it("should create position with zero defaults", () => {
        const pos = Position.from(APOW_ADDR);
        expect(pos.symbol).toBe(Symbol.APOW);
        expect(pos.amount).toBe(0n);
        expect(pos.locked).toBe(0n);
        expect(pos.lockedTotal).toBe(0n);
        expect(pos.capTotal).toEqual({ supply: [0n, 0n], borrow: [0n, 0n] });
        expect(pos.cap).toEqual({ supply: [0n, 0n], borrow: [0n, 0n] });
    });
});
describe("Position.amount", () => {
    it("should return default amount", () => {
        const pos = { ...Position.from(APOW_ADDR), amount: 10n ** 18n };
        expect(Position.amount(pos)).toBe(1);
    });
    it("should convert explicit bigint amount", () => {
        const pos = Position.from(APOW_ADDR);
        expect(Position.amount(pos, 5n * 10n ** 18n)).toBe(5);
    });
});
describe("Position.big", () => {
    it("should convert amount to bigint", () => {
        const pos = Position.from(APOW_ADDR);
        expect(Position.big(pos, 2.5)).toBe(2_500_000_000_000_000_000n);
    });
});
describe("Position.capTotal", () => {
    it("should return normal cap and duration", () => {
        const pos = {
            ...Position.from(APOW_ADDR),
            capTotal: { supply: [10n ** 18n, 3600n], borrow: [0n, 0n] },
        } as any;
        const [amount, seconds] = Position.capTotal(pos, Mode.supply);
        expect(amount).toBe(1);
        expect(seconds).toBe(3600);
    });
    it("should return Infinity for U224 cap", () => {
        const U224 = 2n ** 224n - 1n;
        const pos = {
            ...Position.from(APOW_ADDR),
            capTotal: { supply: [U224, 0n], borrow: [0n, 0n] },
        } as any;
        const [amount] = Position.capTotal(pos, Mode.supply);
        expect(amount).toBe(Infinity);
    });
});
describe("Position.cap", () => {
    it("should return normal cap and duration", () => {
        const pos = {
            ...Position.from(APOW_ADDR),
            cap: { supply: [2n * 10n ** 18n, 7200n], borrow: [0n, 0n] },
        } as any;
        const [amount, seconds] = Position.cap(pos, Mode.supply);
        expect(amount).toBe(2);
        expect(seconds).toBe(7200);
    });
});
describe("Position.locked", () => {
    it("should return locked amount", () => {
        const pos = { ...Position.from(APOW_ADDR), locked: 3n * 10n ** 18n };
        expect(Position.locked(pos)).toBe(3);
    });
    it("should return lockedTotal amount", () => {
        const pos = { ...Position.from(APOW_ADDR), lockedTotal: 5n * 10n ** 18n };
        expect(Position.lockedTotal(pos)).toBe(5);
    });
});
describe("Position.findBy", () => {
    it("should find position by token address", () => {
        const pos = Position.from(APOW_ADDR);
        const found = Position.findBy([pos], Tokens[Symbol.APOW]);
        expect(found).toBe(pos);
    });
    it("should return undefined for missing token", () => {
        const pos = Position.from(APOW_ADDR);
        const found = Position.findBy([pos], Tokens[Symbol.XPOW]);
        expect(found).toBeUndefined();
    });
});
describe("Position.sum", () => {
    it("should return 0 for empty array", () => {
        expect(Position.sum([])).toBe(0);
    });
    it("should sum position amounts", () => {
        const a = { ...Position.from(APOW_ADDR), amount: 10n };
        const b = { ...Position.from(APOW_ADDR), amount: 20n };
        expect(Position.sum([a, b])).toBe(30);
    });
});
describe("Position.eq", () => {
    it("should detect equal positions", () => {
        const a = { ...Position.from(APOW_ADDR), amount: 42n };
        const b = { ...Position.from(APOW_ADDR), amount: 42n };
        expect(Position.eq([a], [b])).toBe(true);
    });
    it("should detect different positions", () => {
        const a = { ...Position.from(APOW_ADDR), amount: 42n };
        const b = { ...Position.from(APOW_ADDR), amount: 99n };
        expect(Position.eq([a], [b])).toBe(false);
    });
    it("should handle undefined and empty inputs", () => {
        expect(Position.eq(undefined, undefined)).toBe(true);
        expect(Position.eq([], [])).toBe(true);
        expect(Position.eq([], undefined)).toBe(false);
        expect(Position.eq(undefined, [])).toBe(false);
    });
});

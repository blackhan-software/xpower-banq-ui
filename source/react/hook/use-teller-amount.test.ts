// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    GLOBAL: globalThis,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

let mockBalance: number | null = 100;
let mockLimit: number | null = 50;
let mockAccount: bigint | null = 1n;

vi.mock("@/react/hook", () => ({
    usePortfolioAmount: () => [mockBalance] as const,
    usePortfolioLimit: () => [mockLimit] as const,
    useWalletAccount: () => [mockAccount, vi.fn()] as const,
}));

let mockStoreState = {
    teller_amount: null as number | null,
    set_teller_amount: vi.fn(),
    teller_percent: 50 as number | null,
    actions: [] as string[],
    reset_actions: vi.fn(),
};

vi.mock("@/zustand", () => ({
    appStore: () => mockStoreState,
}));

import { useTellerAmount } from "./use-teller-amount";
import { Mode } from "@/type";

describe("useTellerAmount", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockBalance = 100;
        mockLimit = 50;
        mockAccount = 1n;
        mockStoreState = {
            teller_amount: null,
            set_teller_amount: vi.fn(),
            teller_percent: 50,
            actions: [],
            reset_actions: vi.fn(),
        };
    });

    it("should return [teller_amount, set_teller_amount]", () => {
        mockStoreState.teller_amount = 42;
        const { result } = renderHook(() => useTellerAmount(Mode.supply));
        expect(result.current[0]).toBe(42);
        expect(typeof result.current[1]).toBe("function");
    });

    it("should calculate amount from balance * percent in supply mode", () => {
        mockStoreState.teller_percent = 50;
        renderHook(() => useTellerAmount(Mode.supply));
        expect(mockStoreState.set_teller_amount).toHaveBeenCalledWith(50);
    });

    it("should calculate amount from limit * percent in borrow mode", () => {
        // limit=50, percent=50 => 50 * 50 / 100 = 25
        mockStoreState.teller_percent = 50;
        renderHook(() => useTellerAmount(Mode.borrow));
        expect(mockStoreState.set_teller_amount).toHaveBeenCalledWith(25);
    });

    it("should not set amount when percent is null", () => {
        mockStoreState.teller_percent = null;
        renderHook(() => useTellerAmount(Mode.supply));
        expect(mockStoreState.set_teller_amount).not.toHaveBeenCalled();
    });

    it("should not set amount when balance is null in supply mode", () => {
        mockBalance = null;
        mockStoreState.teller_percent = 50;
        renderHook(() => useTellerAmount(Mode.supply));
        expect(mockStoreState.set_teller_amount).not.toHaveBeenCalled();
    });

    it("should skip update when actions include teller_amount (recursion guard)", () => {
        mockStoreState.actions = ["teller_amount"];
        mockStoreState.teller_percent = 50;
        renderHook(() => useTellerAmount(Mode.supply));
        expect(mockStoreState.reset_actions).toHaveBeenCalledWith("teller_amount");
        expect(mockStoreState.set_teller_amount).not.toHaveBeenCalled();
    });

    it("should NOT skip when last action is teller_token", () => {
        mockStoreState.actions = ["teller_amount", "teller_token"];
        mockStoreState.teller_percent = 50;
        renderHook(() => useTellerAmount(Mode.supply));
        expect(mockStoreState.set_teller_amount).toHaveBeenCalledWith(50);
    });

    it("should clear amount when account disconnects", () => {
        // Need: !account && amount !== null
        // amount = balance * percent / 100 = 100 * 50 / 100 = 50
        // teller_amount = 50 (same), so first branch skipped
        // !account (true) && amount !== null (true) => set null
        mockAccount = null;
        mockStoreState.teller_percent = 50;
        mockStoreState.teller_amount = 50;
        renderHook(() => useTellerAmount(Mode.supply));
        expect(mockStoreState.set_teller_amount).toHaveBeenCalledWith(null);
    });

    it("should handle 0% percent correctly", () => {
        mockStoreState.teller_percent = 0;
        renderHook(() => useTellerAmount(Mode.supply));
        expect(mockStoreState.set_teller_amount).toHaveBeenCalledWith(0);
    });

    it("should handle 100% percent correctly", () => {
        mockStoreState.teller_percent = 100;
        renderHook(() => useTellerAmount(Mode.supply));
        expect(mockStoreState.set_teller_amount).toHaveBeenCalledWith(100);
    });
});

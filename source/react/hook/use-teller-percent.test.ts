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

let mockBalance: number | null = 200;
let mockLimit: number | null = 100;
let mockAccount: bigint | null = 1n;

vi.mock("@/react/hook", () => ({
    usePortfolioAmount: () => [mockBalance] as const,
    usePortfolioLimit: () => [mockLimit] as const,
    useWalletAccount: () => [mockAccount, vi.fn()] as const,
    useWalletAccountSync: vi.fn(),
}));

let mockStoreState = {
    teller_percent: null as number | null,
    set_teller_percent: vi.fn(),
    teller_amount: 50 as number | null,
    actions: [] as string[],
    reset_actions: vi.fn(),
};

vi.mock("@/zustand", () => ({
    appStore: () => mockStoreState,
}));

import { useTellerPercent } from "./use-teller-percent";
import { Mode } from "@/type";

describe("useTellerPercent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockBalance = 200;
        mockLimit = 100;
        mockAccount = 1n;
        mockStoreState = {
            teller_percent: null,
            set_teller_percent: vi.fn(),
            teller_amount: 50,
            actions: [],
            reset_actions: vi.fn(),
        };
    });

    it("should return [teller_percent, set_teller_percent]", () => {
        mockStoreState.teller_percent = 25;
        const { result } = renderHook(() => useTellerPercent(Mode.supply));
        expect(result.current[0]).toBe(25);
        expect(typeof result.current[1]).toBe("function");
    });

    it("should calculate percent from balance in supply mode", () => {
        // 50 / 200 * 100 = 25%
        mockStoreState.teller_amount = 50;
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.set_teller_percent).toHaveBeenCalledWith(25);
    });

    it("should calculate percent from limit in borrow mode", () => {
        // 50 / 100 * 100 = 50%
        mockStoreState.teller_amount = 50;
        renderHook(() => useTellerPercent(Mode.borrow));
        expect(mockStoreState.set_teller_percent).toHaveBeenCalledWith(50);
    });

    it("should clamp percent to 100 max", () => {
        mockStoreState.teller_amount = 300;
        mockBalance = 200;
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.set_teller_percent).toHaveBeenCalledWith(100);
    });

    it("should return null when amount is null", () => {
        mockStoreState.teller_amount = null;
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.set_teller_percent).not.toHaveBeenCalled();
    });

    it("should return null when balance is null in supply mode", () => {
        mockBalance = null;
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.set_teller_percent).not.toHaveBeenCalled();
    });

    it("should return null when balance is zero in supply mode", () => {
        mockBalance = 0;
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.set_teller_percent).not.toHaveBeenCalled();
    });

    it("should skip when last action is teller_token (guard)", () => {
        mockStoreState.actions = ["teller_token"];
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.reset_actions).toHaveBeenCalledWith("teller_percent");
        expect(mockStoreState.set_teller_percent).not.toHaveBeenCalled();
    });

    it("should skip when last action is teller_mode (guard)", () => {
        mockStoreState.actions = ["teller_mode"];
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.reset_actions).toHaveBeenCalledWith("teller_percent");
        expect(mockStoreState.set_teller_percent).not.toHaveBeenCalled();
    });

    it("should skip when last action is portfolio_amount (guard)", () => {
        mockStoreState.actions = ["portfolio_amount"];
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.reset_actions).toHaveBeenCalledWith("teller_percent");
        expect(mockStoreState.set_teller_percent).not.toHaveBeenCalled();
    });

    it("should skip when last action is portfolio_limits (guard)", () => {
        mockStoreState.actions = ["portfolio_limits"];
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.reset_actions).toHaveBeenCalledWith("teller_percent");
        expect(mockStoreState.set_teller_percent).not.toHaveBeenCalled();
    });

    it("should skip when last action is wallet_account (guard)", () => {
        mockStoreState.actions = ["wallet_account"];
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.reset_actions).toHaveBeenCalledWith("teller_percent");
        expect(mockStoreState.set_teller_percent).not.toHaveBeenCalled();
    });

    it("should skip when actions include teller_percent (recursion guard)", () => {
        mockStoreState.actions = ["teller_percent"];
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.reset_actions).toHaveBeenCalledWith("teller_percent");
        expect(mockStoreState.set_teller_percent).not.toHaveBeenCalled();
    });

    it("should reset percent to 0 when account disconnects", () => {
        mockAccount = null;
        mockStoreState.teller_amount = null;
        mockStoreState.teller_percent = 50;
        renderHook(() => useTellerPercent(Mode.supply));
        expect(mockStoreState.set_teller_percent).toHaveBeenCalledWith(0);
    });
});

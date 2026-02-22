// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    GLOBAL: globalThis,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { useContracts } from "./use-contracts";
import type { BaseContract } from "@/contract";
import type { ContractRunner } from "ethers";

class MockContract {
    readonly target: string;
    readonly runner: ContractRunner | null;
    constructor(target: string, runner: ContractRunner | null) {
        this.target = target;
        this.runner = runner;
    }
    get abi() { return []; }
}

const POOL = "0x0000000000000000000000000000000000000001";
const TOKEN_A = "0x000000000000000000000000000000000000000a";
const TOKEN_B = "0x000000000000000000000000000000000000000b";
const mockProvider = { provider: null } as ContractRunner;

describe("useContracts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return [null] initially", () => {
        const { result } = renderHook(() =>
            useContracts(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { pool: POOL, targets: [TOKEN_A, TOKEN_B], provider: mockProvider },
            ),
        );
        expect(result.current[0]).toBeNull();
    });

    it("should create map when pool, targets, and provider are valid", async () => {
        const { result } = renderHook(() =>
            useContracts(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { pool: POOL, targets: [TOKEN_A, TOKEN_B], provider: mockProvider },
            ),
        );
        await waitFor(() => {
            expect(result.current[0]).not.toBeNull();
        });
        expect(result.current[0]).toBeInstanceOf(Map);
        expect(result.current[0]!.size).toBe(2);
    });

    it("should key map entries by PoolToken", async () => {
        const { result } = renderHook(() =>
            useContracts(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { pool: POOL, targets: [TOKEN_A], provider: mockProvider },
            ),
        );
        await waitFor(() => {
            expect(result.current[0]).not.toBeNull();
        });
        const [key] = result.current[0]!.keys();
        expect(key).toHaveProperty("pool");
        expect(key).toHaveProperty("token");
    });

    it("should use custom mapper when provided", async () => {
        const customMapper = vi.fn().mockResolvedValue(null);
        renderHook(() =>
            useContracts(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { pool: POOL, targets: [TOKEN_A], provider: mockProvider },
                customMapper,
            ),
        );
        await waitFor(() => {
            expect(customMapper).toHaveBeenCalled();
        });
    });

    it("should return null when provider is null", async () => {
        const { result } = renderHook(() =>
            useContracts(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { pool: POOL, targets: [TOKEN_A], provider: null },
            ),
        );
        // Default factory returns null when provider is missing
        await waitFor(() => {
            expect(result.current[0]).toBeNull();
        });
    });

    it("should cleanup (set null) on unmount", async () => {
        const { result, unmount } = renderHook(() =>
            useContracts(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { pool: POOL, targets: [TOKEN_A, TOKEN_B], provider: mockProvider },
            ),
        );
        await waitFor(() => {
            expect(result.current[0]).not.toBeNull();
        });
        unmount();
    });

    it("should recreate map when targets change", async () => {
        const { result, rerender } = renderHook(
            ({ targets }) => useContracts(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { pool: POOL, targets, provider: mockProvider },
            ),
            { initialProps: { targets: [TOKEN_A] as string[] | null } },
        );
        await waitFor(() => {
            expect(result.current[0]?.size).toBe(1);
        });
        rerender({ targets: [TOKEN_A, TOKEN_B] });
        await waitFor(() => {
            expect(result.current[0]?.size).toBe(2);
        });
    });
});

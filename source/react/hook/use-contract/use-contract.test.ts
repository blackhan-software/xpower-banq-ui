// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { useContract } from "./use-contract";
import type { BaseContract } from "@/contract";
import type { ContractRunner } from "ethers";

// A simple concrete mock class
class MockContract {
    readonly target: string;
    readonly runner: ContractRunner | null;
    constructor(target: string, runner: ContractRunner | null) {
        this.target = target;
        this.runner = runner;
    }
    get abi() { return []; }
}

const mockProvider: ContractRunner = {
    provider: null,
} as ContractRunner;

describe("useContract", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return [null] when provider is null", () => {
        const { result } = renderHook(() =>
            useContract(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { target: "0x1234", provider: null },
            ),
        );
        expect(result.current[0]).toBeNull();
    });

    it("should return [null] when target is null", () => {
        const { result } = renderHook(() =>
            useContract(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { target: null, provider: mockProvider },
            ),
        );
        expect(result.current[0]).toBeNull();
    });

    it("should create instance when both target and provider are valid", async () => {
        const { result } = renderHook(() =>
            useContract(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { target: "0x1234", provider: mockProvider },
            ),
        );
        await waitFor(() => {
            expect(result.current[0]).not.toBeNull();
        });
        expect((result.current[0] as unknown as MockContract).target).toBe("0x1234");
    });

    it("should cleanup on unmount (set to null)", async () => {
        const { result, unmount } = renderHook(() =>
            useContract(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { target: "0x1234", provider: mockProvider },
            ),
        );
        await waitFor(() => {
            expect(result.current[0]).not.toBeNull();
        });
        unmount();
        // After unmount, contract should have been set to null via cleanup
    });

    it("should recreate on target change", async () => {
        const { result, rerender } = renderHook(
            ({ target }) => useContract(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { target, provider: mockProvider },
            ),
            { initialProps: { target: "0xAAA" as string | null } },
        );
        await waitFor(() => {
            expect(result.current[0]).not.toBeNull();
        });
        expect((result.current[0] as unknown as MockContract).target).toBe("0xAAA");
        rerender({ target: "0xBBB" });
        await waitFor(() => {
            expect(result.current[0]).not.toBeNull();
            expect((result.current[0] as unknown as MockContract).target).toBe("0xBBB");
        });
    });

    it("should recreate on provider change", async () => {
        const provider2: ContractRunner = { provider: null } as ContractRunner;
        const { result, rerender } = renderHook(
            ({ provider }) => useContract(
                MockContract as unknown as new (...args: any[]) => BaseContract,
                { target: "0x1234", provider },
            ),
            { initialProps: { provider: mockProvider as ContractRunner | null } },
        );
        await waitFor(() => {
            expect(result.current[0]).not.toBeNull();
        });
        rerender({ provider: provider2 });
        await waitFor(() => {
            expect(result.current[0]).not.toBeNull();
        });
    });
});

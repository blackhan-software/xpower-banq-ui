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

const TOKEN_A = "0x000000000000000000000000000000000000000a";
const TOKEN_B = "0x000000000000000000000000000000000000000b";
const VAULT_A = "0x00000000000000000000000000000000000000va";
const VAULT_B = "0x00000000000000000000000000000000000000vb";
const POOL_TARGET = "0x0000000000000000000000000000000000000001";

const mockVaultOf = vi.fn()
    .mockImplementation((ta: string) =>
        ta === TOKEN_A ? Promise.resolve(VAULT_A) : Promise.resolve(VAULT_B),
    );

let mockPoolContract: any = {
    target: POOL_TARGET,
    vaultOf: mockVaultOf,
};
const mockProvider = { provider: null };
let mockTokens: string[] | null = [TOKEN_A, TOKEN_B];

let capturedMapper: any = null;

vi.mock("@/react/hook", () => ({
    usePoolContract: () => [mockPoolContract] as const,
    useRemoteProvider: () => [mockProvider] as const,
    usePoolTokens: () => [mockTokens] as const,
    useContracts: (_ctor: any, _opts: any, mapper: any) => {
        capturedMapper = mapper;
        return [null] as const;
    },
}));

vi.mock("@/contract", () => ({
    PoolContract: class { },
    VaultContract: class {
        target: string;
        constructor(target: string, _provider: any) {
            this.target = target;
        }
    },
}));

import { useVaultContracts } from "./use-vault-contracts";

describe("useVaultContracts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        capturedMapper = null;
        mockPoolContract = {
            target: POOL_TARGET,
            vaultOf: mockVaultOf,
        };
        mockTokens = [TOKEN_A, TOKEN_B];
    });

    it("should provide a custom mapper", () => {
        renderHook(() => useVaultContracts());
        expect(capturedMapper).toBeTypeOf("function");
    });

    it("should return null from mapper when pool_contract is null", async () => {
        mockPoolContract = null;
        renderHook(() => useVaultContracts());
        const result = await capturedMapper();
        expect(result).toBeNull();
    });

    it("should return null from mapper when tokens is null", async () => {
        mockTokens = null;
        renderHook(() => useVaultContracts());
        const result = await capturedMapper();
        expect(result).toBeNull();
    });

    it("should call vaultOf for each token", async () => {
        renderHook(() => useVaultContracts());
        await capturedMapper();
        expect(mockVaultOf).toHaveBeenCalledWith(TOKEN_A);
        expect(mockVaultOf).toHaveBeenCalledWith(TOKEN_B);
    });

    it("should create VaultContract with resolved vault addresses", async () => {
        renderHook(() => useVaultContracts());
        const result = await capturedMapper();
        expect(result).toHaveLength(2);
        expect(result[0][1].target).toBe(VAULT_A);
        expect(result[1][1].target).toBe(VAULT_B);
    });

    it("should key map entries by PoolToken", async () => {
        renderHook(() => useVaultContracts());
        const result = await capturedMapper();
        const [pt] = result[0];
        expect(pt).toHaveProperty("pool");
        expect(pt).toHaveProperty("token");
    });
});

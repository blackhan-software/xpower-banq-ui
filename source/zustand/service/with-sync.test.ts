import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

const mocks = vi.hoisted(() => ({
    syncPortfolioAmount: vi.fn().mockImplementation((store: unknown) => store),
    syncPortfolioSupply: vi.fn().mockImplementation((store: unknown) => store),
    syncPortfolioBorrow: vi.fn().mockImplementation((store: unknown) => store),
    syncPortfolioHealth: vi.fn().mockImplementation((store: unknown) => store),
    syncPortfolioLimits: vi.fn().mockImplementation((store: unknown) => store),
    syncPortfolioYields: vi.fn().mockImplementation((store: unknown) => store),
    RemoteProvider: vi.fn().mockReturnValue({ call: async () => "0x" }),
}));

vi.mock("@/blockchain", () => ({
    RemoteProvider: mocks.RemoteProvider,
}));
vi.mock("./sync-amount", () => ({
    syncPortfolioAmount: mocks.syncPortfolioAmount,
}));
vi.mock("./sync-portfolio", () => ({
    syncPortfolioSupply: mocks.syncPortfolioSupply,
    syncPortfolioBorrow: mocks.syncPortfolioBorrow,
}));
vi.mock("./sync-health", () => ({
    syncPortfolioHealth: mocks.syncPortfolioHealth,
}));
vi.mock("./sync-limits", () => ({
    syncPortfolioLimits: mocks.syncPortfolioLimits,
}));
vi.mock("./sync-yields", () => ({
    syncPortfolioYields: mocks.syncPortfolioYields,
}));

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { withSync } from "./with-sync";

describe("withSync", () => {
    const mockStore = {} as never;

    it("should call all 6 sync services", () => {
        withSync(mockStore);
        expect(mocks.syncPortfolioAmount).toHaveBeenCalledTimes(1);
        expect(mocks.syncPortfolioSupply).toHaveBeenCalledTimes(1);
        expect(mocks.syncPortfolioBorrow).toHaveBeenCalledTimes(1);
        expect(mocks.syncPortfolioHealth).toHaveBeenCalledTimes(1);
        expect(mocks.syncPortfolioLimits).toHaveBeenCalledTimes(1);
        expect(mocks.syncPortfolioYields).toHaveBeenCalledTimes(1);
    });

    it("should pass the remote provider runner to each service", () => {
        const provider = mocks.RemoteProvider();
        withSync(mockStore);
        for (const fn of [
            mocks.syncPortfolioAmount,
            mocks.syncPortfolioSupply,
            mocks.syncPortfolioBorrow,
            mocks.syncPortfolioHealth,
            mocks.syncPortfolioLimits,
            mocks.syncPortfolioYields,
        ]) {
            expect(fn).toHaveBeenCalledWith(
                expect.anything(),
                { runner: provider },
            );
        }
    });

    it("should return the store", () => {
        const result = withSync(mockStore);
        expect(result).toBe(mockStore);
    });

    it("should assert when RemoteProvider returns null", () => {
        mocks.RemoteProvider.mockReturnValueOnce(null);
        expect(() => withSync(mockStore)).toThrow();
    });
});

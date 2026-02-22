import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

const mocks = vi.hoisted(() => ({
    syncHealthBy: vi.fn().mockImplementation((store: unknown) => store),
}));

vi.mock("./sync-health-by", () => ({
    syncHealthBy: mocks.syncHealthBy,
}));

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { syncPortfolioHealth } from "./sync-health";

describe("syncPortfolioHealth", () => {
    const mockStore = {} as never;
    const mockRunner = { provider: null, call: async () => "0x" };

    it("should call syncHealthBy with supplyOf", () => {
        syncPortfolioHealth(mockStore, { runner: mockRunner });
        expect(mocks.syncHealthBy).toHaveBeenCalledWith(
            mockStore,
            { runner: mockRunner, position_of: "supplyOf" },
        );
    });
    it("should call syncHealthBy with borrowOf", () => {
        syncPortfolioHealth(mockStore, { runner: mockRunner });
        expect(mocks.syncHealthBy).toHaveBeenCalledWith(
            expect.anything(),
            { runner: mockRunner, position_of: "borrowOf" },
        );
    });
    it("should call syncHealthBy exactly twice", () => {
        mocks.syncHealthBy.mockClear();
        syncPortfolioHealth(mockStore, { runner: mockRunner });
        expect(mocks.syncHealthBy).toHaveBeenCalledTimes(2);
    });
    it("should return the store", () => {
        const result = syncPortfolioHealth(mockStore, { runner: mockRunner });
        expect(result).toBe(mockStore);
    });
});

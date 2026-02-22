import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { create } from "zustand";
import { withSwap, SwapCreator } from "../middleware/with-swap";
import { createOracleSlice, OracleSlice } from "./oracle-slice";

type TestState = OracleSlice;

function makeStore() {
    const creator: SwapCreator<TestState> = (...a) => ({
        ...(createOracleSlice as any)(...a),
    });
    return create(withSwap(creator));
}

describe("OracleSlice", () => {
    it("should initialize oracle_quote as null", () => {
        const store = makeStore();
        expect(store.getState().oracle_quote).toBeNull();
    });
    it("should set oracle_quote via setter", () => {
        const store = makeStore();
        const map = new Map();
        store.getState().set_oracle_quote(map);
        expect(store.getState().oracle_quote).toBe(map);
    });
    it("should set oracle_quote back to null", () => {
        const store = makeStore();
        store.getState().set_oracle_quote(new Map());
        store.getState().set_oracle_quote(null);
        expect(store.getState().oracle_quote).toBeNull();
    });
});

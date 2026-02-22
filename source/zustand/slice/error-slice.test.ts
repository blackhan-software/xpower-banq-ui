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
import { createErrorSlice, ErrorSlice } from "./error-slice";

type TestState = ErrorSlice;

function makeStore() {
    const creator: SwapCreator<TestState> = (...a) => ({
        ...(createErrorSlice as any)(...a),
    });
    return create(withSwap(creator));
}

describe("ErrorSlice", () => {
    it("should initialize with empty errors map", () => {
        const store = makeStore();
        expect(store.getState().errors).toEqual(new Map());
    });
    it("should set an error by name", () => {
        const store = makeStore();
        const error = new Error("test error");
        store.getState().set_error("sync-amount", error);
        expect(store.getState().errors.get("sync-amount")).toBe(error);
    });
    it("should clear an error when passed null", () => {
        const store = makeStore();
        store.getState().set_error("sync-amount", new Error("fail"));
        store.getState().set_error("sync-amount", null);
        expect(store.getState().errors.has("sync-amount")).toBe(false);
    });
    it("should track multiple errors independently", () => {
        const store = makeStore();
        const e1 = new Error("error 1");
        const e2 = new Error("error 2");
        store.getState().set_error("sync-amount", e1);
        store.getState().set_error("sync-health", e2);
        expect(store.getState().errors.get("sync-amount")).toBe(e1);
        expect(store.getState().errors.get("sync-health")).toBe(e2);
    });
    it("should not affect other errors when clearing one", () => {
        const store = makeStore();
        const e1 = new Error("error 1");
        const e2 = new Error("error 2");
        store.getState().set_error("sync-amount", e1);
        store.getState().set_error("sync-health", e2);
        store.getState().set_error("sync-amount", null);
        expect(store.getState().errors.has("sync-amount")).toBe(false);
        expect(store.getState().errors.get("sync-health")).toBe(e2);
    });
    it("should handle clearing a non-existent error", () => {
        const store = makeStore();
        store.getState().set_error("non-existent", null);
        expect(store.getState().errors.size).toBe(0);
    });
});

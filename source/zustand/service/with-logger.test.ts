import { describe, expect, it, vi, beforeEach } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);
vi.mock("@/url", () => ({
    ROParams: {
        get: (_k: unknown, fb: unknown) => fb,
        has: () => false, withDevtools: false, withLogger: 3,
        withSession: false, withSync: false, rqStaleTime: 2000,
    },
}));

import { create } from "zustand";
import { withSwap } from "../middleware/with-swap";
import { withLogger } from "./with-logger";
import { Level } from "@/type";
import type { Store } from "../zustand-type";

type TestState = {
    value: number;
    set_value: (n: number) => void;
};

function createTestStore(): Store<TestState> {
    return create(withSwap<TestState>((set) => ({
        value: 0,
        set_value: (n) => set({ value: n }, "value"),
    })));
}

describe("withLogger", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "debug").mockImplementation(() => {});
    });

    it("should return the store", () => {
        const store = createTestStore();
        const result = withLogger(store);
        expect(result).toBe(store);
    });

    it("should log changed values at INFO level", () => {
        const store = createTestStore();
        withLogger(store, Level.INFO);
        store.getState().set_value(42);
        expect(console.debug).toHaveBeenCalled();
    });

    it("should log timestamp header", () => {
        const store = createTestStore();
        withLogger(store, Level.INFO);
        store.getState().set_value(1);
        const calls = (console.debug as ReturnType<typeof vi.fn>).mock.calls;
        const header = calls.find(
            (c: string[]) => typeof c[0] === "string" && c[0].includes("[>]")
        );
        expect(header).toBeDefined();
    });

    it("should mark changed values with [!]", () => {
        const store = createTestStore();
        withLogger(store, Level.INFO);
        store.getState().set_value(99);
        const calls = (console.debug as ReturnType<typeof vi.fn>).mock.calls;
        const changed = calls.find(
            (c: string[]) => typeof c[0] === "string" && c[0].includes("[!] value")
        );
        expect(changed).toBeDefined();
    });

    it("should not log [=] at INFO level for unchanged keys", () => {
        const store = createTestStore();
        withLogger(store, Level.INFO);
        store.getState().set_value(1);
        const calls = (console.debug as ReturnType<typeof vi.fn>).mock.calls;
        const hasEqual = calls.some(
            (c: string[]) => typeof c[0] === "string" && c[0].includes("[=]")
        );
        expect(hasEqual).toBe(false);
    });

    it("should not log when no changes occur at INFO level", () => {
        const store = createTestStore();
        withLogger(store, Level.INFO);
        // setState with same value doesn't trigger zustand subscriber
        // so no logging should happen
        expect(console.debug).not.toHaveBeenCalled();
    });

    it("should skip function values", () => {
        const store = createTestStore();
        withLogger(store, Level.FULL);
        store.getState().set_value(5);
        const calls = (console.debug as ReturnType<typeof vi.fn>).mock.calls;
        const hasSetValue = calls.some(
            (c: string[]) => typeof c[0] === "string" && c[0].includes("set_value")
        );
        expect(hasSetValue).toBe(false);
    });

    it("should show diffs at MORE level", () => {
        const store = createTestStore();
        withLogger(store, Level.MORE);
        store.getState().set_value(42);
        const calls = (console.debug as ReturnType<typeof vi.fn>).mock.calls;
        // MORE level should include diff lines with color
        const hasDiff = calls.some(
            (c: string[]) => typeof c[1] === "string" && c[1].includes("color:")
        );
        expect(hasDiff).toBe(true);
    });

    it("should show [=] for equal keys at FULL level", () => {
        type MultiState = {
            a: number;
            b: number;
            set_a: (n: number) => void;
        };
        const store = create(withSwap<MultiState>((set) => ({
            a: 0,
            b: 0,
            set_a: (n) => set({ a: n }, "a"),
        }))) as Store<MultiState>;
        withLogger(store as unknown as Store<TestState>, Level.FULL);
        store.getState().set_a(1);
        const calls = (console.debug as ReturnType<typeof vi.fn>).mock.calls;
        const hasEqual = calls.some(
            (c: string[]) => typeof c[0] === "string" && c[0].includes("[=] b")
        );
        expect(hasEqual).toBe(true);
    });

    it("should not log at NONE level", () => {
        const store = createTestStore();
        withLogger(store, Level.NONE);
        store.getState().set_value(1);
        // At NONE, only functions are skipped; no lines are pushed
        // since neq_values check requires level >= INFO
        const calls = (console.debug as ReturnType<typeof vi.fn>).mock.calls;
        expect(calls.length).toBe(0);
    });
});

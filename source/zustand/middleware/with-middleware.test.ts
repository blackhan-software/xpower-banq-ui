import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

const mockROParams = vi.hoisted(() => ({
    get: (_k: unknown, fb: unknown) => fb,
    has: () => false,
    withDevtools: false,
    withLogger: 0,
    withSession: false,
    withSync: false,
    rqStaleTime: 2000,
}));

vi.mock("@/url", () => ({
    ROParams: mockROParams,
    RWParams: {
        pool: 300n, mode: "supply", portfolio: true,
        token: { address: "0x0", decimals: 0n, supply: 0n, symbol: "NONE" },
    },
}));

import { withMiddleware } from "./index";

type TestState = {
    value: number;
    set_value: (n: number) => void;
};

describe("withMiddleware", () => {
    it("should create a store with withSwap always applied", () => {
        const store = withMiddleware<TestState>((set) => ({
            value: 0,
            set_value: (n) => set({ value: n }, "value"),
        }));
        expect(store.getState().value).toBe(0);
        store.getState().set_value(42);
        expect(store.getState().value).toBe(42);
    });

    it("should conditionally apply devtools when ROParams.withDevtools is true", () => {
        mockROParams.withDevtools = true;
        const store = withMiddleware<TestState>((set) => ({
            value: 0,
            set_value: (n) => set({ value: n }, "value"),
        }));
        store.getState().set_value(10);
        expect(store.getState().value).toBe(10);
        mockROParams.withDevtools = false;
    });

    it("should skip devtools when ROParams.withDevtools is false", () => {
        mockROParams.withDevtools = false;
        const store = withMiddleware<TestState>((set) => ({
            value: 0,
            set_value: (n) => set({ value: n }, "value"),
        }));
        store.getState().set_value(5);
        expect(store.getState().value).toBe(5);
    });

    it("should conditionally apply session when ROParams.withSession is true", () => {
        mockROParams.withSession = true;
        const store = withMiddleware<TestState>((set) => ({
            value: 0,
            set_value: (n) => set({ value: n }, "value"),
        }));
        store.getState().set_value(99);
        expect(store.getState().value).toBe(99);
        mockROParams.withSession = false;
    });

    it("should accept session options", () => {
        mockROParams.withSession = true;
        const store = withMiddleware<TestState>((set) => ({
            value: 0,
            set_value: (n) => set({ value: n }, "value"),
        }), {
            session: {
                partialize: (s) => ({ value: s.value } as Partial<TestState>),
            },
        });
        store.getState().set_value(77);
        expect(store.getState().value).toBe(77);
        mockROParams.withSession = false;
    });
});

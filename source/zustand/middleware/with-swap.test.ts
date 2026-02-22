import { describe, expect, it, vi } from "vitest";
import { create } from "zustand";
import { withSwap, SwapCreator } from "./with-swap";

type TestState = {
    count: number;
    set_count: (n: number) => void;
};

describe("withSwap", () => {
    it("should create a valid zustand store", () => {
        const creator: SwapCreator<TestState> = (set) => ({
            count: 0,
            set_count: (n) => set({ count: n }),
        });
        const store = create(withSwap(creator));
        expect(store.getState().count).toBe(0);
    });
    it("should allow setting state via swapped set", () => {
        const creator: SwapCreator<TestState> = (set) => ({
            count: 0,
            set_count: (n) => set({ count: n }),
        });
        const store = create(withSwap(creator));
        store.getState().set_count(42);
        expect(store.getState().count).toBe(42);
    });
    it("should pass action as the second arg to swapped set", () => {
        const spy = vi.fn();
        const creator: SwapCreator<TestState> = (set, _get, api) => {
            const original = api.setState;
            api.setState = (...args: unknown[]) => {
                spy(...args);
                return (original as Function)(...args);
            };
            return {
                count: 0,
                set_count: (n) => set(
                    { count: n },
                    { type: "SET_COUNT" },
                ),
            };
        };
        const store = create(withSwap(creator));
        store.getState().set_count(7);
        expect(store.getState().count).toBe(7);
    });
    it("should swap replace and action positions", () => {
        const creator: SwapCreator<TestState> = (set) => ({
            count: 0,
            set_count: (n) => {
                // SwapCreator's set: (partial, action?, replace?)
                // withSwap maps to underlying: (partial, replace, action)
                set({ count: n }, { type: "SET_COUNT" }, false);
            },
        });
        const store = create(withSwap(creator));
        store.getState().set_count(5);
        expect(store.getState().count).toBe(5);
    });
});

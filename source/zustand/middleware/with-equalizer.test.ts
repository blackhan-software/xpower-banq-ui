import { describe, expect, it, vi } from "vitest";
import { polyfill } from "@/function/polyfill/polyfill";
polyfill(JSON.parse);

vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { create, StateCreator } from "zustand";
import { withEqualizer, Equalizer } from "./with-equalizer";

type TestState = {
    value: number;
    setValue: (v: number) => void;
};

/**
 * Wrapper middleware that captures actions from the inner layer,
 * since raw zustand setState ignores the action argument.
 */
// deno-lint-ignore no-explicit-any
function withActionCapture<T>(
    creator: Equalizer<T>,
    captured: unknown[],
    // deno-lint-ignore no-explicit-any
): StateCreator<T, [], any> {
    // deno-lint-ignore no-explicit-any
    return ((set: any, get: any, api: any) => {
        // deno-lint-ignore no-explicit-any
        const set3 = (partial: any, replace: any, action: any) => {
            captured.push(action);
            set(partial, replace);
        };
        return (creator as Function)(set3, get, api);
        // deno-lint-ignore no-explicit-any
    }) as StateCreator<T, [], any>;
}

describe("withEqualizer", () => {
    it("should append ! to typed action when state is unchanged", () => {
        const captured: unknown[] = [];
        const creator: StateCreator<TestState> = (set) => ({
            value: 1,
            // deno-lint-ignore no-explicit-any
            setValue: (v) => (set as any)(
                { value: v }, false, { type: "SET_VALUE" }
            ),
        });
        const store = create(
            withActionCapture(withEqualizer(creator), captured)
        );
        store.getState().setValue(1); // same value — idempotent
        expect(captured).toHaveLength(1);
        expect(captured[0]).toEqual({ type: "SET_VALUE!" });
    });
    it("should not append ! when state actually changes", () => {
        const captured: unknown[] = [];
        const creator: StateCreator<TestState> = (set) => ({
            value: 1,
            // deno-lint-ignore no-explicit-any
            setValue: (v) => (set as any)(
                { value: v }, false, { type: "SET_VALUE" }
            ),
        });
        const store = create(
            withActionCapture(withEqualizer(creator), captured)
        );
        store.getState().setValue(2); // different value
        expect(captured[0]).toEqual({ type: "SET_VALUE" });
    });
    it("should pass through non-typed actions unchanged", () => {
        const captured: unknown[] = [];
        const creator: StateCreator<TestState> = (set) => ({
            value: 1,
            // deno-lint-ignore no-explicit-any
            setValue: (v) => (set as any)(
                { value: v }, false, "plain_action"
            ),
        });
        const store = create(
            withActionCapture(withEqualizer(creator), captured)
        );
        store.getState().setValue(1); // same value, but string action
        expect(captured[0]).toBe("plain_action"); // not modified
    });
    it("should handle function-style partial state", () => {
        const captured: unknown[] = [];
        const creator: StateCreator<TestState> = (set) => ({
            value: 1,
            // deno-lint-ignore no-explicit-any
            setValue: (v) => (set as any)(
                (_s: TestState) => ({ value: v }),
                false,
                { type: "FN_SET" }
            ),
        });
        const store = create(
            withActionCapture(withEqualizer(creator), captured)
        );
        store.getState().setValue(1); // same value via function
        expect(captured[0]).toEqual({ type: "FN_SET!" });
    });
});

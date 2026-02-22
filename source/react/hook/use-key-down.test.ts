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

import { useKeyDown } from "./use-key-down";

describe("useKeyDown", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fire callback on matching key", () => {
        const cb = vi.fn();
        renderHook(() => useKeyDown("Enter", cb));
        globalThis.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        expect(cb).toHaveBeenCalledOnce();
    });

    it("should ignore non-matching key", () => {
        const cb = vi.fn();
        renderHook(() => useKeyDown("Enter", cb));
        globalThis.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        expect(cb).not.toHaveBeenCalled();
    });

    it("should respect ctrlKey modifier", () => {
        const cb = vi.fn();
        renderHook(() => useKeyDown("ArrowRight", cb, { ctrlKey: true }));
        // Without ctrl: should not fire
        globalThis.dispatchEvent(new KeyboardEvent("keydown", {
            key: "ArrowRight", ctrlKey: false,
        }));
        expect(cb).not.toHaveBeenCalled();
        // With ctrl: should fire
        globalThis.dispatchEvent(new KeyboardEvent("keydown", {
            key: "ArrowRight", ctrlKey: true,
        }));
        expect(cb).toHaveBeenCalledOnce();
    });

    it("should respect shiftKey modifier", () => {
        const cb = vi.fn();
        renderHook(() => useKeyDown("ArrowLeft", cb, { shiftKey: true }));
        globalThis.dispatchEvent(new KeyboardEvent("keydown", {
            key: "ArrowLeft", shiftKey: false,
        }));
        expect(cb).not.toHaveBeenCalled();
        globalThis.dispatchEvent(new KeyboardEvent("keydown", {
            key: "ArrowLeft", shiftKey: true,
        }));
        expect(cb).toHaveBeenCalledOnce();
    });

    it("should respect combined modifiers (ctrl+shift)", () => {
        const cb = vi.fn();
        renderHook(() => useKeyDown("ArrowUp", cb, {
            ctrlKey: true, shiftKey: true,
        }));
        // Only ctrl: should not fire
        globalThis.dispatchEvent(new KeyboardEvent("keydown", {
            key: "ArrowUp", ctrlKey: true, shiftKey: false,
        }));
        expect(cb).not.toHaveBeenCalled();
        // Both: should fire
        globalThis.dispatchEvent(new KeyboardEvent("keydown", {
            key: "ArrowUp", ctrlKey: true, shiftKey: true,
        }));
        expect(cb).toHaveBeenCalledOnce();
    });

    it("should not fire when extra modifier is pressed", () => {
        const cb = vi.fn();
        renderHook(() => useKeyDown("a", cb)); // no modifiers
        globalThis.dispatchEvent(new KeyboardEvent("keydown", {
            key: "a", ctrlKey: true,
        }));
        expect(cb).not.toHaveBeenCalled();
    });

    it("should cleanup on unmount", () => {
        const cb = vi.fn();
        const { unmount } = renderHook(() => useKeyDown("Enter", cb));
        unmount();
        globalThis.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        expect(cb).not.toHaveBeenCalled();
    });
});

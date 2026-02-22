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

import { useKeyUp } from "./use-key-up";

describe("useKeyUp", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fire callback on matching key", () => {
        const cb = vi.fn();
        renderHook(() => useKeyUp("Enter", cb));
        globalThis.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
        expect(cb).toHaveBeenCalledOnce();
    });

    it("should ignore non-matching key", () => {
        const cb = vi.fn();
        renderHook(() => useKeyUp("Enter", cb));
        globalThis.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape" }));
        expect(cb).not.toHaveBeenCalled();
    });

    it("should respect ctrlKey modifier", () => {
        const cb = vi.fn();
        renderHook(() => useKeyUp("ArrowRight", cb, { ctrlKey: true }));
        globalThis.dispatchEvent(new KeyboardEvent("keyup", {
            key: "ArrowRight", ctrlKey: false,
        }));
        expect(cb).not.toHaveBeenCalled();
        globalThis.dispatchEvent(new KeyboardEvent("keyup", {
            key: "ArrowRight", ctrlKey: true,
        }));
        expect(cb).toHaveBeenCalledOnce();
    });

    it("should respect shiftKey modifier", () => {
        const cb = vi.fn();
        renderHook(() => useKeyUp("ArrowLeft", cb, { shiftKey: true }));
        globalThis.dispatchEvent(new KeyboardEvent("keyup", {
            key: "ArrowLeft", shiftKey: false,
        }));
        expect(cb).not.toHaveBeenCalled();
        globalThis.dispatchEvent(new KeyboardEvent("keyup", {
            key: "ArrowLeft", shiftKey: true,
        }));
        expect(cb).toHaveBeenCalledOnce();
    });

    it("should respect combined modifiers (ctrl+shift)", () => {
        const cb = vi.fn();
        renderHook(() => useKeyUp("ArrowUp", cb, {
            ctrlKey: true, shiftKey: true,
        }));
        globalThis.dispatchEvent(new KeyboardEvent("keyup", {
            key: "ArrowUp", ctrlKey: true, shiftKey: false,
        }));
        expect(cb).not.toHaveBeenCalled();
        globalThis.dispatchEvent(new KeyboardEvent("keyup", {
            key: "ArrowUp", ctrlKey: true, shiftKey: true,
        }));
        expect(cb).toHaveBeenCalledOnce();
    });

    it("should not fire when extra modifier is pressed", () => {
        const cb = vi.fn();
        renderHook(() => useKeyUp("a", cb));
        globalThis.dispatchEvent(new KeyboardEvent("keyup", {
            key: "a", ctrlKey: true,
        }));
        expect(cb).not.toHaveBeenCalled();
    });

    it("should cleanup on unmount", () => {
        const cb = vi.fn();
        const { unmount } = renderHook(() => useKeyUp("Enter", cb));
        unmount();
        globalThis.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
        expect(cb).not.toHaveBeenCalled();
    });

    it("should respect altKey modifier", () => {
        const cb = vi.fn();
        renderHook(() => useKeyUp("a", cb, { altKey: true }));
        globalThis.dispatchEvent(new KeyboardEvent("keyup", {
            key: "a", altKey: false,
        }));
        expect(cb).not.toHaveBeenCalled();
        globalThis.dispatchEvent(new KeyboardEvent("keyup", {
            key: "a", altKey: true,
        }));
        expect(cb).toHaveBeenCalledOnce();
    });
});

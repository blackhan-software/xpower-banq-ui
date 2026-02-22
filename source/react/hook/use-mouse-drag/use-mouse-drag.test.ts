// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { useMouseDrag } from "./use-mouse-drag";

describe("useMouseDrag", () => {
    let el: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();
        el = document.createElement("div");
        document.body.appendChild(el);
    });

    function renderDrag(init = 0) {
        const xory = (e: MouseEvent | TouchEvent, _el: HTMLDivElement) => {
            return e instanceof MouseEvent ? e.clientX : 0;
        };
        return renderHook(() => {
            const ref = useRef<HTMLDivElement>(el);
            return useMouseDrag(ref, init, xory);
        });
    }

    it("should return [Δ+δ, δ, ref]", () => {
        const { result } = renderDrag();
        expect(result.current[0]).toBe(0);
        expect(result.current[1]).toBe(0);
        expect(result.current[2].current).toBe(el);
    });

    it("should return init value before any drag", () => {
        const { result } = renderDrag(50);
        expect(result.current[0]).toBe(50);
    });

    it("should track delta during drag", () => {
        const { result } = renderDrag();
        // Start drag at x=100
        act(() => {
            el.dispatchEvent(new MouseEvent("mousedown", {
                clientX: 100, bubbles: true,
            }));
        });
        // Move to x=80 (delta = 100-80 = 20)
        act(() => {
            el.dispatchEvent(new MouseEvent("mousemove", {
                clientX: 80, bubbles: true,
            }));
        });
        expect(result.current[1]).toBe(20); // per-drag δ
        expect(result.current[0]).toBe(20); // Δ + δ
    });

    it("should accumulate total after mouseup", () => {
        const { result } = renderDrag();
        // First drag: 100 → 80 (delta = 20)
        act(() => {
            el.dispatchEvent(new MouseEvent("mousedown", {
                clientX: 100, bubbles: true,
            }));
        });
        act(() => {
            el.dispatchEvent(new MouseEvent("mousemove", {
                clientX: 80, bubbles: true,
            }));
        });
        act(() => {
            el.dispatchEvent(new MouseEvent("mouseup", {
                clientX: 80, bubbles: true,
            }));
        });
        // After mouseup: Δ = 20, δ = 0
        expect(result.current[0]).toBe(20);
        expect(result.current[1]).toBe(0);
    });

    it("should accumulate across multiple drags", () => {
        const { result } = renderDrag();
        // First drag: delta = 20
        act(() => {
            el.dispatchEvent(new MouseEvent("mousedown", { clientX: 100, bubbles: true }));
            el.dispatchEvent(new MouseEvent("mousemove", { clientX: 80, bubbles: true }));
            el.dispatchEvent(new MouseEvent("mouseup", { clientX: 80, bubbles: true }));
        });
        // Second drag: delta = 10
        act(() => {
            el.dispatchEvent(new MouseEvent("mousedown", { clientX: 50, bubbles: true }));
            el.dispatchEvent(new MouseEvent("mousemove", { clientX: 40, bubbles: true }));
            el.dispatchEvent(new MouseEvent("mouseup", { clientX: 40, bubbles: true }));
        });
        expect(result.current[0]).toBe(30); // 20 + 10
    });

    it("should not track delta without mousedown", () => {
        const { result } = renderDrag();
        act(() => {
            el.dispatchEvent(new MouseEvent("mousemove", {
                clientX: 80, bubbles: true,
            }));
        });
        expect(result.current[0]).toBe(0);
        expect(result.current[1]).toBe(0);
    });

    it("should reset on double-tap", () => {
        const { result } = renderDrag(0);
        // Drag to accumulate some delta
        act(() => {
            el.dispatchEvent(new MouseEvent("mousedown", { clientX: 100, bubbles: true }));
            el.dispatchEvent(new MouseEvent("mousemove", { clientX: 80, bubbles: true }));
            el.dispatchEvent(new MouseEvent("mouseup", { clientX: 80, bubbles: true }));
        });
        expect(result.current[0]).toBe(20);
        // Double-click resets
        act(() => {
            el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
        });
        expect(result.current[0]).toBe(0);
        expect(result.current[1]).toBe(0);
    });

    it("should cleanup on unmount", () => {
        const { unmount } = renderDrag();
        unmount();
        // Events after unmount should not throw or cause updates
        el.dispatchEvent(new MouseEvent("mousedown", { clientX: 100, bubbles: true }));
        el.dispatchEvent(new MouseEvent("mousemove", { clientX: 50, bubbles: true }));
        el.dispatchEvent(new MouseEvent("mouseup", { clientX: 50, bubbles: true }));
    });
});

// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useDoubleTap } from "./use-double-tap";

describe("useDoubleTap", () => {
    let el: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();
        el = document.createElement("div");
        document.body.appendChild(el);
    });

    function renderDoubleTap(handler: (e: MouseEvent | TouchEvent) => void, ms = 200) {
        return renderHook(() => {
            const ref = useRef<HTMLDivElement>(el);
            return useDoubleTap(ref, handler, ms);
        });
    }

    it("should return the ref", () => {
        const handler = vi.fn();
        const { result } = renderDoubleTap(handler);
        expect(result.current[0].current).toBe(el);
    });

    it("should call handler on dblclick", () => {
        const handler = vi.fn();
        renderDoubleTap(handler);
        el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
    });

    it("should call handler on rapid double touchstart", () => {
        vi.useFakeTimers();
        const handler = vi.fn();
        renderDoubleTap(handler, 200);
        // First tap
        el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
        expect(handler).not.toHaveBeenCalled();
        // Second tap within 200ms
        vi.advanceTimersByTime(100);
        el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        vi.useRealTimers();
    });

    it("should NOT call handler on slow double touchstart", () => {
        vi.useFakeTimers();
        const handler = vi.fn();
        renderDoubleTap(handler, 200);
        el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
        // Wait longer than the threshold
        vi.advanceTimersByTime(300);
        el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
        expect(handler).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it("should cleanup listeners on unmount", () => {
        const handler = vi.fn();
        const { unmount } = renderDoubleTap(handler);
        unmount();
        el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
        expect(handler).not.toHaveBeenCalled();
    });
});

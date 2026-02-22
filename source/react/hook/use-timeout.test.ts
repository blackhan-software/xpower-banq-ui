// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimeout } from "./use-timeout";

describe("useTimeout", () => {
    it("should call callback after delay", () => {
        vi.useFakeTimers();
        const cb = vi.fn();
        renderHook(() => useTimeout(cb, 100));
        expect(cb).not.toHaveBeenCalled();
        vi.advanceTimersByTime(100);
        expect(cb).toHaveBeenCalledOnce();
        vi.useRealTimers();
    });
    it("should not fire when delay is null", () => {
        vi.useFakeTimers();
        const cb = vi.fn();
        renderHook(() => useTimeout(cb, null));
        vi.advanceTimersByTime(10000);
        expect(cb).not.toHaveBeenCalled();
        vi.useRealTimers();
    });
    it("should clear timeout on unmount", () => {
        vi.useFakeTimers();
        const cb = vi.fn();
        const { unmount } = renderHook(() => useTimeout(cb, 200));
        vi.advanceTimersByTime(100);
        unmount();
        vi.advanceTimersByTime(200);
        expect(cb).not.toHaveBeenCalled();
        vi.useRealTimers();
    });
    it("should return a clear function", () => {
        vi.useFakeTimers();
        const cb = vi.fn();
        const { result } = renderHook(() => useTimeout(cb, 500));
        expect(typeof result.current).toBe("function");
        vi.useRealTimers();
    });
    it("should reset timeout when delay changes", () => {
        vi.useFakeTimers();
        const cb = vi.fn();
        const { rerender } = renderHook(
            ({ delay }) => useTimeout(cb, delay),
            { initialProps: { delay: 200 as number | null } },
        );
        vi.advanceTimersByTime(100);
        rerender({ delay: 300 });
        vi.advanceTimersByTime(200);
        expect(cb).not.toHaveBeenCalled();
        vi.advanceTimersByTime(100);
        expect(cb).toHaveBeenCalledOnce();
        vi.useRealTimers();
    });
});

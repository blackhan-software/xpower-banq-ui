import { describe, expect, it, vi } from "vitest";
import { buffered } from "./buffered";

describe("buffered", () => {
    it("should delay function execution", async () => {
        vi.useFakeTimers();
        const fn = vi.fn(() => 42);
        const bf = buffered(fn, 100);
        const p = bf();
        expect(fn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(100);
        const result = await p;
        expect(fn).toHaveBeenCalledOnce();
        expect(result).toBe(42);
        vi.useRealTimers();
    });
    it("should cancel previous pending call on re-invocation", async () => {
        vi.useFakeTimers();
        const fn = vi.fn(() => "ok");
        const bf = buffered(fn, 100);
        bf(); // first call — will be cancelled
        vi.advanceTimersByTime(50);
        const p = bf(); // second call — replaces first
        vi.advanceTimersByTime(100);
        await p;
        expect(fn).toHaveBeenCalledOnce();
        vi.useRealTimers();
    });
    it("should provide a cancel() method", () => {
        vi.useFakeTimers();
        const fn = vi.fn();
        const bf = buffered(fn, 100);
        bf();
        bf.cancel();
        vi.advanceTimersByTime(200);
        expect(fn).not.toHaveBeenCalled();
        vi.useRealTimers();
    });
    it("should pass arguments to the function", async () => {
        vi.useFakeTimers();
        const fn = vi.fn((a: number, b: number) => a + b);
        const bf = buffered(fn, 50);
        const p = bf(3, 4);
        vi.advanceTimersByTime(50);
        const result = await p;
        expect(result).toBe(7);
        expect(fn).toHaveBeenCalledWith(3, 4);
        vi.useRealTimers();
    });
    it("should default to 200ms delay", async () => {
        vi.useFakeTimers();
        const fn = vi.fn();
        const bf = buffered(fn);
        bf();
        vi.advanceTimersByTime(199);
        expect(fn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledOnce();
        vi.useRealTimers();
    });
});

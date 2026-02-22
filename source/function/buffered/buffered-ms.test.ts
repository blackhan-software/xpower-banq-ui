import { describe, expect, it, vi } from "vitest";
import { buffered_ms } from "./buffered-ms";

describe("buffered_ms", () => {
    it("should default to 0ms delay", async () => {
        vi.useFakeTimers();
        const fn = vi.fn(() => "done");
        const bf = buffered_ms(fn);
        const p = bf();
        expect(fn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(0);
        const result = await p;
        expect(fn).toHaveBeenCalledOnce();
        expect(result).toBe("done");
        vi.useRealTimers();
    });
    it("should be cancelable", () => {
        vi.useFakeTimers();
        const fn = vi.fn();
        const bf = buffered_ms(fn);
        bf();
        bf.cancel();
        vi.advanceTimersByTime(100);
        expect(fn).not.toHaveBeenCalled();
        vi.useRealTimers();
    });
    it("should accept custom delay", async () => {
        vi.useFakeTimers();
        const fn = vi.fn(() => 99);
        const bf = buffered_ms(fn, 50);
        const p = bf();
        vi.advanceTimersByTime(49);
        expect(fn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        const result = await p;
        expect(result).toBe(99);
        vi.useRealTimers();
    });
});

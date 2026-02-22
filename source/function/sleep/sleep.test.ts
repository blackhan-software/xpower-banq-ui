import { describe, expect, it, vi } from "vitest";
import { sleep } from "./sleep";

describe("sleep", () => {
    it("should return a promise", () => {
        vi.useFakeTimers();
        const p = sleep(100);
        expect(p).toBeInstanceOf(Promise);
        vi.advanceTimersByTime(100);
        vi.useRealTimers();
    });
    it("should resolve after the specified delay", async () => {
        vi.useFakeTimers();
        let resolved = false;
        sleep(50).then(() => { resolved = true; });
        expect(resolved).toBe(false);
        vi.advanceTimersByTime(50);
        await Promise.resolve(); // flush microtasks
        expect(resolved).toBe(true);
        vi.useRealTimers();
    });
});

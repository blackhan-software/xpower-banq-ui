import { describe, expect, it, vi } from "vitest";
import { withRetry } from "./with-retry";

describe("withRetry", () => {
    it("should retry after base delay on failure", async () => {
        vi.useFakeTimers();
        const fn = vi.fn().mockRejectedValue(new Error("fail"));
        const onError = vi.fn();
        const onSuccess = vi.fn();
        withRetry(fn, onError, onSuccess, { base: 100 });
        // first retry scheduled at 100ms
        expect(fn).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(100);
        expect(fn).toHaveBeenCalledOnce();
        expect(onError).toHaveBeenCalledOnce();
        vi.useRealTimers();
    });
    it("should use exponential backoff", async () => {
        vi.useFakeTimers();
        const fn = vi.fn().mockRejectedValue(new Error("fail"));
        const onError = vi.fn();
        const onSuccess = vi.fn();
        withRetry(fn, onError, onSuccess, { base: 100, max: 5 });
        // attempt 0: delay = 100ms
        await vi.advanceTimersByTimeAsync(100);
        expect(fn).toHaveBeenCalledTimes(1);
        // attempt 1: delay = 200ms
        await vi.advanceTimersByTimeAsync(200);
        expect(fn).toHaveBeenCalledTimes(2);
        // attempt 2: delay = 400ms
        await vi.advanceTimersByTimeAsync(400);
        expect(fn).toHaveBeenCalledTimes(3);
        vi.useRealTimers();
    });
    it("should respect ceiling", async () => {
        vi.useFakeTimers();
        const fn = vi.fn().mockRejectedValue(new Error("fail"));
        const onError = vi.fn();
        const onSuccess = vi.fn();
        withRetry(fn, onError, onSuccess, {
            base: 100, ceiling: 300, max: 5,
        });
        // attempt 0: delay = min(100, 300) = 100
        await vi.advanceTimersByTimeAsync(100);
        expect(fn).toHaveBeenCalledTimes(1);
        // attempt 1: delay = min(200, 300) = 200
        await vi.advanceTimersByTimeAsync(200);
        expect(fn).toHaveBeenCalledTimes(2);
        // attempt 2: delay = min(400, 300) = 300
        await vi.advanceTimersByTimeAsync(300);
        expect(fn).toHaveBeenCalledTimes(3);
        vi.useRealTimers();
    });
    it("should stop after max attempts", async () => {
        vi.useFakeTimers();
        const fn = vi.fn().mockRejectedValue(new Error("fail"));
        const onError = vi.fn();
        const onSuccess = vi.fn();
        withRetry(fn, onError, onSuccess, {
            base: 100, ceiling: 100, max: 2,
        });
        await vi.advanceTimersByTimeAsync(100); // attempt 0 → 1
        await vi.advanceTimersByTimeAsync(100); // attempt 1 → 2 (= max)
        // no more scheduled
        await vi.advanceTimersByTimeAsync(1000);
        expect(fn).toHaveBeenCalledTimes(2);
        vi.useRealTimers();
    });
    it("should call onSuccess on recovery after failure", async () => {
        vi.useFakeTimers();
        const fn = vi.fn()
            .mockRejectedValueOnce(new Error("fail"))
            .mockResolvedValueOnce(undefined);
        const onError = vi.fn();
        const onSuccess = vi.fn();
        withRetry(fn, onError, onSuccess, { base: 100 });
        // first attempt fails
        await vi.advanceTimersByTimeAsync(100);
        expect(onError).toHaveBeenCalledOnce();
        expect(onSuccess).not.toHaveBeenCalled();
        // second attempt succeeds
        await vi.advanceTimersByTimeAsync(200);
        expect(onSuccess).toHaveBeenCalledOnce();
        vi.useRealTimers();
    });
    it("should call onSuccess on first attempt (created after failure)", async () => {
        vi.useFakeTimers();
        const fn = vi.fn().mockResolvedValue(undefined);
        const onError = vi.fn();
        const onSuccess = vi.fn();
        withRetry(fn, onError, onSuccess, { base: 100 });
        await vi.advanceTimersByTimeAsync(100);
        expect(onSuccess).toHaveBeenCalledOnce();
        expect(onError).not.toHaveBeenCalled();
        vi.useRealTimers();
    });
    it("should cancel pending retry", async () => {
        vi.useFakeTimers();
        const fn = vi.fn().mockRejectedValue(new Error("fail"));
        const onError = vi.fn();
        const onSuccess = vi.fn();
        const handle = withRetry(fn, onError, onSuccess, { base: 100 });
        handle.cancel();
        await vi.advanceTimersByTimeAsync(1000);
        expect(fn).not.toHaveBeenCalled();
        vi.useRealTimers();
    });
    it("should retry immediately on manual retry()", async () => {
        vi.useFakeTimers();
        const fn = vi.fn().mockResolvedValue(undefined);
        const onError = vi.fn();
        const onSuccess = vi.fn();
        const handle = withRetry(fn, onError, onSuccess, { base: 10_000 });
        // cancel scheduled retry and trigger immediately
        handle.retry();
        await vi.advanceTimersByTimeAsync(0);
        expect(fn).toHaveBeenCalledOnce();
        expect(onSuccess).toHaveBeenCalledOnce();
        vi.useRealTimers();
    });
    it("should use defaults (base=1000, ceiling=30000, max=5)", async () => {
        vi.useFakeTimers();
        const fn = vi.fn().mockRejectedValue(new Error("fail"));
        const onError = vi.fn();
        const onSuccess = vi.fn();
        withRetry(fn, onError, onSuccess);
        // default base = 1000ms
        await vi.advanceTimersByTimeAsync(999);
        expect(fn).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);
        expect(fn).toHaveBeenCalledOnce();
        vi.useRealTimers();
    });
});

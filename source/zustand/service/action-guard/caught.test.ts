import { describe, expect, it, vi } from "vitest";

vi.mock("@/contract", () => ({}));

import { caught } from "./caught";

describe("caught", () => {
    it("should forward args to the wrapped listener", () => {
        const listener = vi.fn();
        const [wrapped] = caught("test", listener);
        wrapped("0xfrom", "0xto", 100n);
        expect(listener).toHaveBeenCalledWith("0xfrom", "0xto", 100n);
    });
    it("should call onError on rejected promise", async () => {
        const error = new Error("boom");
        const listener = vi.fn().mockRejectedValue(error);
        const onError = vi.fn();
        vi.spyOn(console, "error").mockImplementation(() => {});
        const [wrapped] = caught("sync-test", listener, onError);
        wrapped("0xa", "0xb", 42n);
        await new Promise((r) => setTimeout(r, 0));
        expect(onError).toHaveBeenCalledWith("sync-test", error);
        vi.restoreAllMocks();
    });
    it("should retry after failure with exponential backoff", async () => {
        vi.useFakeTimers();
        const error = new Error("rpc fail");
        const listener = vi.fn().mockRejectedValue(error);
        const onError = vi.fn();
        vi.spyOn(console, "error").mockImplementation(() => {});
        const [wrapped] = caught(
            "sync-test", listener, onError, { base: 100, max: 3 },
        );
        wrapped("0xa", "0xb", 1n);
        await vi.advanceTimersByTimeAsync(0); // flush initial rejection
        expect(listener).toHaveBeenCalledTimes(1);
        // first retry at 100ms
        await vi.advanceTimersByTimeAsync(100);
        expect(listener).toHaveBeenCalledTimes(2);
        // second retry at 200ms
        await vi.advanceTimersByTimeAsync(200);
        expect(listener).toHaveBeenCalledTimes(3);
        vi.useRealTimers();
        vi.restoreAllMocks();
    });
    it("should clear error on successful retry", async () => {
        vi.useFakeTimers();
        const listener = vi.fn()
            .mockRejectedValueOnce(new Error("fail"))
            .mockResolvedValueOnce(undefined);
        const onError = vi.fn();
        vi.spyOn(console, "error").mockImplementation(() => {});
        const [wrapped] = caught(
            "sync-test", listener, onError, { base: 100 },
        );
        wrapped("0xa", "0xb", 1n);
        await vi.advanceTimersByTimeAsync(0); // flush initial rejection
        expect(onError).toHaveBeenCalledWith("sync-test", expect.any(Error));
        // successful retry clears error
        await vi.advanceTimersByTimeAsync(100);
        expect(onError).toHaveBeenCalledWith("sync-test", null);
        vi.useRealTimers();
        vi.restoreAllMocks();
    });
    it("should cancel retry on new Transfer event", async () => {
        vi.useFakeTimers();
        const listener = vi.fn().mockRejectedValue(new Error("fail"));
        const onError = vi.fn();
        vi.spyOn(console, "error").mockImplementation(() => {});
        const [wrapped] = caught(
            "sync-test", listener, onError, { base: 100 },
        );
        wrapped("0xa", "0xb", 1n);
        await vi.advanceTimersByTimeAsync(0); // flush rejection, retry scheduled
        expect(listener).toHaveBeenCalledTimes(1);
        // new event arrives before retry fires → cancels pending retry
        wrapped("0xc", "0xd", 2n);
        await vi.advanceTimersByTimeAsync(0);
        // the retry from the first call should not fire
        await vi.advanceTimersByTimeAsync(100);
        // only the new event's retry fires (3 = initial + new event + one retry)
        expect(listener).toHaveBeenCalledTimes(3);
        vi.useRealTimers();
        vi.restoreAllMocks();
    });
    it("should stop retries on cancelRetry()", async () => {
        vi.useFakeTimers();
        const listener = vi.fn().mockRejectedValue(new Error("fail"));
        const onError = vi.fn();
        vi.spyOn(console, "error").mockImplementation(() => {});
        const [wrapped, cancelRetry] = caught(
            "sync-test", listener, onError, { base: 100 },
        );
        wrapped("0xa", "0xb", 1n);
        await vi.advanceTimersByTimeAsync(0);
        expect(listener).toHaveBeenCalledTimes(1);
        cancelRetry();
        await vi.advanceTimersByTimeAsync(1000);
        expect(listener).toHaveBeenCalledTimes(1);
        vi.useRealTimers();
        vi.restoreAllMocks();
    });
    it("should not catch when listener returns resolved promise", async () => {
        const listener = vi.fn().mockResolvedValue(undefined);
        const onError = vi.fn();
        const [wrapped] = caught("test", listener, onError);
        wrapped("0xa", "0xb", 1n);
        await new Promise((r) => setTimeout(r, 0));
        expect(onError).not.toHaveBeenCalled();
    });
    it("should handle synchronous listener (non-promise)", () => {
        const listener = vi.fn().mockReturnValue(undefined);
        const onError = vi.fn();
        const [wrapped] = caught("test", listener, onError);
        wrapped("0xa", "0xb", 0n);
        expect(onError).not.toHaveBeenCalled();
    });
});

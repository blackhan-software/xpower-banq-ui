import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

let blockCallback: (() => void) | undefined;

const mockDestroy = vi.fn();
const mockGetBlockNumber = vi.fn<() => Promise<number>>();

vi.mock("ethers", () => ({
    WebSocketProvider: function (_url: string) {
        return {
            once: (_event: string, cb: () => void) => {
                blockCallback = cb;
            },
            getBlockNumber: mockGetBlockNumber,
            destroy: mockDestroy,
        };
    },
}));

import { WSProvider } from "./ws-provider";

describe("WSProvider", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        blockCallback = undefined;
        mockDestroy.mockClear();
        mockGetBlockNumber.mockClear();
        vi.stubGlobal("location", { reload: vi.fn() });
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("should create a WebSocketProvider", () => {
        const ws = new WSProvider("wss://example.com", 1000);
        expect(ws.provider).toBeDefined();
        expect(ws.provider.once).toBeDefined();
        ws.dispose();
    });

    it("should not start keep-alive before block event", () => {
        const ws = new WSProvider("wss://example.com", 1000);
        vi.advanceTimersByTime(5000);
        expect(mockGetBlockNumber).not.toHaveBeenCalled();
        ws.dispose();
    });

    it("should start keep-alive after block event", () => {
        mockGetBlockNumber.mockResolvedValue(100);
        const ws = new WSProvider("wss://example.com", 1000);
        blockCallback?.();
        vi.advanceTimersByTime(1000);
        expect(mockGetBlockNumber).toHaveBeenCalledTimes(1);
        ws.dispose();
    });

    it("should reset failures on successful ping", async () => {
        mockGetBlockNumber.mockResolvedValue(100);
        const ws = new WSProvider("wss://example.com", 1000);
        blockCallback?.();
        // first ping
        vi.advanceTimersByTime(1000);
        await vi.advanceTimersByTimeAsync(0);
        // second ping
        vi.advanceTimersByTime(1000);
        await vi.advanceTimersByTimeAsync(0);
        // no reload after 2 successful pings
        expect(location.reload).not.toHaveBeenCalled();
        ws.dispose();
    });

    it("should increment failures on getBlockNumber rejection", async () => {
        mockGetBlockNumber.mockRejectedValue(new Error("ws error"));
        new WSProvider("wss://example.com", 1000);
        blockCallback?.();
        // 1st failure
        vi.advanceTimersByTime(1000);
        await vi.advanceTimersByTimeAsync(0);
        expect(location.reload).not.toHaveBeenCalled();
        // 2nd failure
        vi.advanceTimersByTime(1000);
        await vi.advanceTimersByTimeAsync(0);
        expect(location.reload).not.toHaveBeenCalled();
        // 3rd failure → reconnect
        vi.advanceTimersByTime(1000);
        await vi.advanceTimersByTimeAsync(0);
        expect(mockDestroy).toHaveBeenCalled();
        expect(location.reload).toHaveBeenCalled();
    });

    it("should reconnect on ping timeout after max failures", async () => {
        // getBlockNumber never resolves → timeout fires
        mockGetBlockNumber.mockImplementation(
            () => new Promise<number>(() => {}),
        );
        const ws = new WSProvider("wss://example.com", 1000);
        blockCallback?.();
        // Each interval tick sets a timeout that fires after polling_ms
        // 1st interval fires at t=1000, timeout fires at t=2000
        vi.advanceTimersByTime(2000);
        expect(location.reload).not.toHaveBeenCalled();
        // 2nd interval fires at t=2000, timeout fires at t=3000
        vi.advanceTimersByTime(1000);
        expect(location.reload).not.toHaveBeenCalled();
        // 3rd interval fires at t=3000, timeout fires at t=4000
        vi.advanceTimersByTime(1000);
        expect(location.reload).toHaveBeenCalled();
        void ws;
    });

    it("should not start keep-alive if disposed before block", () => {
        const ws = new WSProvider("wss://example.com", 1000);
        ws.dispose();
        blockCallback?.();
        vi.advanceTimersByTime(5000);
        expect(mockGetBlockNumber).not.toHaveBeenCalled();
    });

    it("should skip ping if disposed during interval", async () => {
        mockGetBlockNumber.mockResolvedValue(100);
        const ws = new WSProvider("wss://example.com", 1000);
        blockCallback?.();
        vi.advanceTimersByTime(500);
        ws.dispose();
        vi.advanceTimersByTime(1000);
        await vi.advanceTimersByTimeAsync(0);
        expect(mockGetBlockNumber).not.toHaveBeenCalled();
    });

    describe("dispose", () => {
        it("should clear interval and destroy provider", () => {
            mockGetBlockNumber.mockResolvedValue(100);
            const ws = new WSProvider("wss://example.com", 1000);
            blockCallback?.();
            vi.advanceTimersByTime(1000);
            ws.dispose();
            expect(mockDestroy).toHaveBeenCalled();
            // further ticks should not call getBlockNumber again
            const callsBefore = mockGetBlockNumber.mock.calls.length;
            vi.advanceTimersByTime(5000);
            expect(mockGetBlockNumber.mock.calls.length).toBe(callsBefore);
        });

        it("should be safe to call twice", () => {
            const ws = new WSProvider("wss://example.com", 1000);
            ws.dispose();
            ws.dispose();
            expect(mockDestroy).toHaveBeenCalledTimes(2);
        });
    });

    it("should recover after transient failures", async () => {
        let callCount = 0;
        mockGetBlockNumber.mockImplementation(() => {
            callCount++;
            if (callCount <= 2) {
                return Promise.reject(new Error("transient"));
            }
            return Promise.resolve(200);
        });
        const ws = new WSProvider("wss://example.com", 1000);
        blockCallback?.();
        // 1st ping: failure
        vi.advanceTimersByTime(1000);
        await vi.advanceTimersByTimeAsync(0);
        // 2nd ping: failure
        vi.advanceTimersByTime(1000);
        await vi.advanceTimersByTimeAsync(0);
        // 3rd ping: success → resets failures
        vi.advanceTimersByTime(1000);
        await vi.advanceTimersByTimeAsync(0);
        expect(location.reload).not.toHaveBeenCalled();
        // 4th + 5th: more failures, but still below threshold
        mockGetBlockNumber.mockRejectedValue(new Error("again"));
        vi.advanceTimersByTime(1000);
        await vi.advanceTimersByTimeAsync(0);
        vi.advanceTimersByTime(1000);
        await vi.advanceTimersByTimeAsync(0);
        expect(location.reload).not.toHaveBeenCalled();
        ws.dispose();
    });
});

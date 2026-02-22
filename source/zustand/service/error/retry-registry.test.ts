import { beforeEach, describe, expect, it, vi } from "vitest";
import { RetryHandle } from "@/function";

let RETRY_REGISTRY: typeof import("./retry-registry").RETRY_REGISTRY;

beforeEach(async () => {
    vi.resetModules();
    RETRY_REGISTRY = (await import("./retry-registry")).RETRY_REGISTRY;
});

function mockHandle(): RetryHandle {
    return { cancel: vi.fn(), retry: vi.fn() };
}

describe("RETRY_REGISTRY", () => {
    it("should call retry on all registered handles via retryAll", () => {
        const h1 = mockHandle();
        const h2 = mockHandle();
        RETRY_REGISTRY.register("sync-a", h1);
        RETRY_REGISTRY.register("sync-b", h2);
        RETRY_REGISTRY.retryAll();
        expect(h1.retry).toHaveBeenCalledOnce();
        expect(h2.retry).toHaveBeenCalledOnce();
    });
    it("should not retry unregistered handles", () => {
        const h = mockHandle();
        RETRY_REGISTRY.register("sync-a", h);
        RETRY_REGISTRY.unregister("sync-a", h);
        RETRY_REGISTRY.retryAll();
        expect(h.retry).not.toHaveBeenCalled();
    });
    it("should support multiple handles per name", () => {
        const h1 = mockHandle();
        const h2 = mockHandle();
        RETRY_REGISTRY.register("sync-a", h1);
        RETRY_REGISTRY.register("sync-a", h2);
        RETRY_REGISTRY.retryAll();
        expect(h1.retry).toHaveBeenCalledOnce();
        expect(h2.retry).toHaveBeenCalledOnce();
    });
    it("should only unregister the specified handle", () => {
        const h1 = mockHandle();
        const h2 = mockHandle();
        RETRY_REGISTRY.register("sync-a", h1);
        RETRY_REGISTRY.register("sync-a", h2);
        RETRY_REGISTRY.unregister("sync-a", h1);
        RETRY_REGISTRY.retryAll();
        expect(h1.retry).not.toHaveBeenCalled();
        expect(h2.retry).toHaveBeenCalledOnce();
    });
    it("should handle unregister for unknown name gracefully", () => {
        const h = mockHandle();
        expect(() => RETRY_REGISTRY.unregister("unknown", h)).not.toThrow();
    });
    it("should do nothing on retryAll when empty", () => {
        expect(() => RETRY_REGISTRY.retryAll()).not.toThrow();
    });
});

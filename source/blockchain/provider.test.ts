import { describe, expect, it, vi } from "vitest";

vi.mock("@/constant", () => ({
    PROVIDER_URL: "https://api.avax.network/ext/bc/C/rpc",
}));
vi.mock("@/blockchain", () => ({
    ethereum: null,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal, {
        random: () => "0xdeadbeef",
    })
);
vi.mock("@metamask/detect-provider", () => ({
    default: vi.fn().mockResolvedValue(null),
}));

import { Provider, RemoteProvider } from "./provider";

describe("Provider", () => {
    describe("with http URL", () => {
        it("should return a JsonRpcProvider", () => {
            const pro = Provider({
                url: "https://rpc.example.com/json",
            });
            expect(pro).not.toBeNull();
            expect(pro?.constructor.name).toBe("JsonRpcProvider");
        });
        it("should set polling interval", () => {
            const pro = Provider({
                url: "https://rpc.example.com/poll",
                polling_ms: 5000,
            });
            expect(pro).not.toBeNull();
            expect((pro as any).pollingInterval).toBe(5000);
        });
        it("should default polling to 2000ms", () => {
            const pro = Provider({
                url: "https://rpc.example.com/default",
            });
            expect((pro as any).pollingInterval).toBe(2000);
        });
    });
    describe("memoization", () => {
        it("should return the same instance for same options", () => {
            const a = Provider({
                url: "https://rpc.example.com/memo",
            });
            const b = Provider({
                url: "https://rpc.example.com/memo",
            });
            expect(a).toBe(b);
        });
        it("should return different instances for different options", () => {
            const a = Provider({
                url: "https://rpc.example.com/a",
            });
            const b = Provider({
                url: "https://rpc.example.com/b",
            });
            expect(a).not.toBe(b);
        });
    });
    describe("with no URL and no mm_provider", () => {
        it("should return null", () => {
            const pro = Provider({});
            expect(pro).toBeNull();
        });
    });
    describe("with mm_provider", () => {
        it("should return a BrowserProvider", () => {
            const mm = {
                request: vi.fn().mockResolvedValue(null),
                isConnected: () => true,
            };
            const pro = Provider({ mm_provider: mm as any });
            expect(pro).not.toBeNull();
            expect(pro?.constructor.name).toBe("BrowserProvider");
        });
    });
});

describe("RemoteProvider", () => {
    it("should use PROVIDER_URL by default", () => {
        const pro = RemoteProvider();
        expect(pro).not.toBeNull();
    });
    it("should accept a url override", () => {
        const pro = RemoteProvider({
            url: "https://custom.rpc.example.com",
        });
        expect(pro).not.toBeNull();
    });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { polyfill } from "@/function/polyfill/polyfill";
polyfill(JSON.parse);

vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

const store = new Map<string, string>();
vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
});

import { SessionStorage } from "./session-storage";

describe("SessionStorage", () => {
    beforeEach(() => {
        store.clear();
    });
    it("should return null for missing key", () => {
        const storage = SessionStorage<{ x: number }>();
        expect(storage.getItem("missing")).toBeNull();
    });
    it("should return parsed JSON for existing key", () => {
        const data = { state: { x: 42 }, version: 1 };
        store.set("test-key", JSON.stringify(data));
        const storage = SessionStorage<{ x: number }>();
        expect(storage.getItem("test-key")).toEqual(data);
    });
    it("should store a JSON-stringified value", () => {
        const storage = SessionStorage<{ x: number }>();
        const data = { state: { x: 99 }, version: 2 };
        storage.setItem("test-key", data);
        const raw = store.get("test-key");
        expect(raw).toBe(JSON.stringify(data));
    });
    it("should delete the key on removeItem", () => {
        store.set("test-key", "data");
        const storage = SessionStorage<{ x: number }>();
        storage.removeItem("test-key");
        expect(store.has("test-key")).toBe(false);
    });
    it("should handle bigint serialization via polyfill", () => {
        const storage = SessionStorage<{ n: bigint }>();
        const data = { state: { n: 42n }, version: 1 };
        storage.setItem("test-key", data);
        const result = storage.getItem("test-key");
        expect(result).toEqual(data);
    });
});

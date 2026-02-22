import { describe, expect, it, vi, beforeEach } from "vitest";

vi.hoisted(() => {
    globalThis.location = { search: "", hash: "", pathname: "/" } as any;
    globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} } as any;
    globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} } as any;
});

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);

import { ROParams } from "./ro-params";

describe("ROParams", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe("get", () => {
        it("should parse boolean true from query", () => {
            ROParams._search = new URLSearchParams("?flag=true");
            expect(ROParams.get("flag", false)).toBe(true);
        });
        it("should parse boolean false from query", () => {
            ROParams._search = new URLSearchParams("?flag=false");
            expect(ROParams.get("flag", true)).toBe(false);
        });
        it("should return boolean fallback when key missing", () => {
            ROParams._search = new URLSearchParams("");
            expect(ROParams.get("flag", true)).toBe(true);
        });
        it("should parse number from query", () => {
            ROParams._search = new URLSearchParams("?n=5000");
            expect(ROParams.get("n", 2000)).toBe(5000);
        });
        it("should return number fallback when key missing", () => {
            ROParams._search = new URLSearchParams("");
            expect(ROParams.get("n", 2000)).toBe(2000);
        });
        it("should parse bigint from query", () => {
            ROParams._search = new URLSearchParams("?b=42");
            expect(ROParams.get("b", 0n)).toBe(42n);
        });
        it("should return bigint fallback when key missing", () => {
            ROParams._search = new URLSearchParams("");
            expect(ROParams.get("b", 99n)).toBe(99n);
        });
        it("should parse string from query", () => {
            ROParams._search = new URLSearchParams("?s=hello");
            expect(ROParams.get("s", "default")).toBe("hello");
        });
        it("should return string fallback when key missing", () => {
            ROParams._search = new URLSearchParams("");
            expect(ROParams.get("s", "default")).toBe("default");
        });
        it("should use first matching key from array", () => {
            ROParams._search = new URLSearchParams("?b=10");
            expect(ROParams.get(["a", "b"], 0)).toBe(10);
        });
        it("should skip null keys and use later match", () => {
            ROParams._search = new URLSearchParams("?second=42");
            expect(ROParams.get(["first", "second"], 0)).toBe(42);
        });
        it("should use callable fallback", () => {
            ROParams._search = new URLSearchParams("?k=yes");
            const result = ROParams.get("k", (t) => t === "yes");
            expect(result).toBe(true);
        });
        it("should pass null to callable fallback when key missing", () => {
            ROParams._search = new URLSearchParams("");
            const result = ROParams.get("k", (t) => t === null);
            expect(result).toBe(true);
        });
    });
    describe("has", () => {
        it("should return true when key exists", () => {
            ROParams._search = new URLSearchParams("?k=1");
            expect(ROParams.has("k")).toBe(true);
        });
        it("should return false when key missing", () => {
            ROParams._search = new URLSearchParams("");
            expect(ROParams.has("k")).toBe(false);
        });
        it("should return true when any key in array exists", () => {
            ROParams._search = new URLSearchParams("?b=1");
            expect(ROParams.has(["a", "b"])).toBe(true);
        });
        it("should return false when no key in array exists", () => {
            ROParams._search = new URLSearchParams("");
            expect(ROParams.has(["a", "b"])).toBe(false);
        });
    });
    describe("rqStaleTime", () => {
        it("should return custom value from query", () => {
            ROParams._search = new URLSearchParams("?rq-stale-time=5000");
            expect(ROParams.rqStaleTime).toBe(5000);
        });
        it("should return default 2000 when not set", () => {
            ROParams._search = new URLSearchParams("");
            expect(ROParams.rqStaleTime).toBe(2000);
        });
    });
    describe("withSync", () => {
        it("should return false when explicitly disabled", () => {
            ROParams._search = new URLSearchParams("?with-sync=false");
            expect(ROParams.withSync).toBe(false);
        });
        it("should return true by default", () => {
            ROParams._search = new URLSearchParams("");
            expect(ROParams.withSync).toBe(true);
        });
    });
});

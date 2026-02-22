import { describe, expect, it, vi, beforeEach } from "vitest";

vi.hoisted(() => {
    globalThis.location = { search: "", hash: "", pathname: "/" } as any;
    globalThis.history = { pushState: vi.fn() } as any;
    globalThis.document = { title: "" } as any;
    globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} } as any;
    globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} } as any;
});

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { ROParams } from "./ro-params";
import { RWParams } from "./rw-params";
import { Mode } from "@/type";

describe("RWParams", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        ROParams._search = new URLSearchParams("");
    });
    describe("account", () => {
        it("should return 0n when not set", () => {
            expect(RWParams.account).toBe(0n);
        });
        it("should return parsed bigint from query", () => {
            ROParams._search = new URLSearchParams("?account=42");
            expect(RWParams.account).toBe(42n);
        });
        it("should set account via pushState", () => {
            const spy = vi.spyOn(history, "pushState");
            RWParams.account = 99n;
            expect(spy).toHaveBeenCalled();
            const url = spy.mock.calls[0]![2] as string;
            expect(url).toContain("account=");
        });
        it("should delete account when set to null", () => {
            const spy = vi.spyOn(history, "pushState");
            RWParams.account = null;
            expect(spy).toHaveBeenCalled();
            const url = spy.mock.calls[0]![2] as string;
            expect(url).not.toContain("account=");
        });
    });
    describe("portfolio", () => {
        it("should return true by default", () => {
            expect(RWParams.portfolio).toBe(true);
        });
        it("should return false when set to 0", () => {
            ROParams._search = new URLSearchParams("?portfolio=0");
            expect(RWParams.portfolio).toBe(false);
        });
        it("should set portfolio=0 via pushState when false", () => {
            const spy = vi.spyOn(history, "pushState");
            RWParams.portfolio = false;
            expect(spy).toHaveBeenCalled();
            const url = spy.mock.calls[0]![2] as string;
            expect(url).toContain("portfolio=0");
        });
        it("should delete portfolio param when set to true", () => {
            const spy = vi.spyOn(history, "pushState");
            RWParams.portfolio = true;
            expect(spy).toHaveBeenCalled();
            const url = spy.mock.calls[0]![2] as string;
            expect(url).not.toContain("portfolio=");
        });
    });
    describe("pool", () => {
        it("should return P000_ADDRESS by default", () => {
            expect(RWParams.pool).toBe(300n);
        });
        it("should set pool via pushState", () => {
            const spy = vi.spyOn(history, "pushState");
            RWParams.pool = 301n;
            expect(spy).toHaveBeenCalled();
            const url = spy.mock.calls[0]![2] as string;
            expect(url).toContain("pool=");
        });
        it("should delete pool when set to null", () => {
            const spy = vi.spyOn(history, "pushState");
            RWParams.pool = null;
            expect(spy).toHaveBeenCalled();
            const url = spy.mock.calls[0]![2] as string;
            expect(url).not.toContain("pool=");
        });
    });
    describe("mode", () => {
        it("should return supply by default", () => {
            expect(RWParams.mode).toBe("supply");
        });
        it("should set mode via pushState", () => {
            const spy = vi.spyOn(history, "pushState");
            RWParams.mode = Mode.borrow;
            expect(spy).toHaveBeenCalled();
            const url = spy.mock.calls[0]![2] as string;
            expect(url).toContain("mode=borrow");
        });
        it("should delete mode when set to null", () => {
            const spy = vi.spyOn(history, "pushState");
            RWParams.mode = null;
            expect(spy).toHaveBeenCalled();
            const url = spy.mock.calls[0]![2] as string;
            expect(url).not.toContain("mode=");
        });
    });
    describe("_search", () => {
        it("should return URLSearchParams from location.search", () => {
            const search = RWParams._search();
            expect(search).toBeInstanceOf(URLSearchParams);
        });
    });
    describe("_hash", () => {
        it("should return location.hash", () => {
            expect(RWParams._hash()).toBe("");
        });
    });
    describe("_pathname", () => {
        it("should return location.pathname", () => {
            expect(RWParams._pathname()).toBe("/");
        });
    });
    describe("_push", () => {
        it("should call history.pushState with constructed URL", () => {
            const spy = vi.spyOn(history, "pushState");
            const search = new URLSearchParams("?foo=bar");
            RWParams._push({ search });
            expect(spy).toHaveBeenCalledWith(
                { page: 1 },
                expect.any(String),
                expect.stringContaining("?foo=bar"),
            );
        });
        it("should omit ? prefix when search is empty", () => {
            const spy = vi.spyOn(history, "pushState");
            RWParams._push({ search: new URLSearchParams("") });
            expect(spy).toHaveBeenCalled();
            const url = spy.mock.calls[0]![2] as string;
            expect(url).not.toContain("?");
        });
    });
});

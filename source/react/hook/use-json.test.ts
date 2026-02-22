// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useJSON } from "./use-json";

describe("useJSON", () => {
    it("should return [null, 0] for undefined", () => {
        const { result } = renderHook(() => useJSON(undefined));
        expect(result.current[0]).toBeNull();
        expect(result.current[1]).toBe(0);
    });
    it("should stringify an object", () => {
        const obj = { a: 1, b: "two" };
        const { result } = renderHook(() => useJSON(obj));
        expect(result.current[0]).toBe(JSON.stringify(obj));
        expect(result.current[1]).toBe(JSON.stringify(obj).length);
    });
    it("should stringify a primitive", () => {
        const { result } = renderHook(() => useJSON(42));
        expect(result.current[0]).toBe("42");
        expect(result.current[1]).toBe(2);
    });
    it("should stringify an array", () => {
        const arr = [1, 2, 3];
        const { result } = renderHook(() => useJSON(arr));
        expect(result.current[0]).toBe("[1,2,3]");
        expect(result.current[1]).toBe(7);
    });
    it("should return readonly tuple", () => {
        const { result } = renderHook(() => useJSON("test"));
        const [json, len] = result.current;
        expect(typeof json).toBe("string");
        expect(typeof len).toBe("number");
    });
});

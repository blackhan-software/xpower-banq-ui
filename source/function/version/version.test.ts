import { describe, expect, it } from "vitest";
import { v } from "./version";

describe("v (re-export)", () => {
    it("should delegate to Version.v", () => {
        expect(v("v10a")).toBe(1001);
        expect(v("10a")).toBe(1001);
    });
});

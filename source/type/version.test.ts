import { describe, expect, it } from "vitest";
import { Version } from "./version";

describe("Version.from", () => {
    it("should parse major + minor", () => {
        expect(Version.from("v10a")).toEqual({ major: 10, minor: 1 });
        expect(Version.from("v10b")).toEqual({ major: 10, minor: 2 });
    });
    it("should parse major only", () => {
        expect(Version.from("v10")).toEqual({ major: 10, minor: 0 });
        expect(Version.from("v2")).toEqual({ major: 2, minor: 0 });
    });
    it("should parse without v prefix", () => {
        expect(Version.from("10a")).toEqual({ major: 10, minor: 1 });
        expect(Version.from("9z")).toEqual({ major: 9, minor: 26 });
    });
    it("should return zero for invalid input", () => {
        expect(Version.from("")).toEqual({ major: 0, minor: 0 });
        expect(Version.from("abc")).toEqual({ major: 0, minor: 0 });
    });
});
describe("Version.v", () => {
    it("should parse major + minor", () => {
        expect(Version.v("v10a")).toBe(1001);
        expect(Version.v("v10b")).toBe(1002);
    });
    it("should parse major only", () => {
        expect(Version.v("v10")).toBe(1000);
        expect(Version.v("v2")).toBe(200);
    });
    it("should parse without v prefix", () => {
        expect(Version.v("10a")).toBe(1001);
        expect(Version.v("10b")).toBe(1002);
        expect(Version.v("9z")).toBe(926);
        expect(Version.v("2")).toBe(200);
    });
    it("should return 0 for invalid input", () => {
        expect(Version.v("")).toBe(0);
        expect(Version.v("abc")).toBe(0);
    });
    it("should compare correctly: v10a > v9z", () => {
        expect(Version.v("v10a")).toBeGreaterThan(Version.v("v9z"));
    });
    it("should compare correctly: v10a > v2", () => {
        expect(Version.v("v10a")).toBeGreaterThan(Version.v("v2"));
    });
    it("should compare correctly: v10b > v10a", () => {
        expect(Version.v("v10b")).toBeGreaterThan(Version.v("v10a"));
    });
    it("should compare with mixed prefixes", () => {
        expect(Version.v("v10a")).toBe(Version.v("10a"));
        expect(Version.v("v10a")).toBeGreaterThan(Version.v("9z"));
    });
});

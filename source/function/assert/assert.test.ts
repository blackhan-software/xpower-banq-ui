import { describe, expect, it } from "vitest";
import { assert } from "./assert";

describe('assert', () => {
    //
    // assert falsy values
    //
    it("should throw an assert-error", () => {
        expect(() => assert(false, "message")).toThrow("message");
    });
    it("should throw an assert-error", () => {
        expect(() => assert(null, "message")).toThrow("message");
    });
    it("should throw an assert-error", () => {
        expect(() => assert(undefined, "message")).toThrow("message");
    });
    it("should throw an assert-error", () => {
        expect(() => assert("", "message")).toThrow("message");
    });
    it("should throw an assert-error", () => {
        expect(() => assert(0, "message")).toThrow("message");
    });
    //
    // assert truthy values
    //
    it("should not throw an assert-error", () => {
        expect(() => assert(true, "message")).not.toThrow();
    });
    it("should not throw an assert-error", () => {
        expect(() => assert(() => { }, "message")).not.toThrow();
    });
    it("should not throw an assert-error", () => {
        expect(() => assert({}, "message")).not.toThrow();
    });
    it("should not throw an assert-error", () => {
        expect(() => assert([], "message")).not.toThrow();
    });
    it("should not throw an assert-error", () => {
        expect(() => assert("1", "message")).not.toThrow();
    });
    it("should not throw an assert-error", () => {
        expect(() => assert(1, "message")).not.toThrow();
    });
});

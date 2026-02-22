import { describe, expect, it } from "vitest";
import { Mode } from "./mode";

describe("Mode.from", () => {
    it("should return supply for 'supply'", () => {
        expect(Mode.from("supply")).toBe(Mode.supply);
    });
    it("should return borrow for 'borrow'", () => {
        expect(Mode.from("borrow")).toBe(Mode.borrow);
    });
    it("should throw for invalid input", () => {
        expect(() => Mode.from("invalid")).toThrow("invalid mode: invalid");
    });
    it("should throw for empty string", () => {
        expect(() => Mode.from("")).toThrow("invalid mode: ");
    });
});
describe("Mode.modal", () => {
    it("should return 'supplied' for supply", () => {
        expect(Mode.modal(Mode.supply)).toBe("supplied");
    });
    it("should return 'borrowed' for borrow", () => {
        expect(Mode.modal(Mode.borrow)).toBe("borrowed");
    });
});

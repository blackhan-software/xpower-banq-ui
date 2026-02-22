import { describe, expect, it } from "vitest";
import { ChainId } from "./chain-id";

describe("ChainId", () => {
    describe("from", () => {
        it("should return AVALANCHE_MAINNET for 0xa86a", () => {
            expect(ChainId.from("0xa86a")).toBe(ChainId.AVALANCHE_MAINNET);
        });
        it("should return AVALANCHE_FUJI for 0xa869", () => {
            expect(ChainId.from("0xa869")).toBe(ChainId.AVALANCHE_FUJI);
        });
        it("should return NETWORK_OTHER for unknown chain", () => {
            expect(ChainId.from("0x1")).toBe(ChainId.NETWORK_OTHER);
        });
        it("should return null for null", () => {
            expect(ChainId.from(null)).toBeNull();
        });
        it("should return null for empty string", () => {
            expect(ChainId.from("")).toBeNull();
        });
    });
    describe("isAvalanche", () => {
        it("should return true for mainnet", () => {
            expect(ChainId.isAvalanche(ChainId.AVALANCHE_MAINNET)).toBe(true);
        });
        it("should return true for fuji", () => {
            expect(ChainId.isAvalanche(ChainId.AVALANCHE_FUJI)).toBe(true);
        });
        it("should return false for other", () => {
            expect(ChainId.isAvalanche(ChainId.NETWORK_OTHER)).toBe(false);
        });
    });
});

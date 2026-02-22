import { describe, expect, it } from "vitest";
import { Status } from "./status";

describe("Status", () => {
    describe("label", () => {
        it("should return 'Install Wallet' for NoProvider", () => {
            expect(Status.label(Status.NoProvider)).toBe("Install Wallet");
        });
        it("should return 'Switch Network' for WrongNetwork", () => {
            expect(Status.label(Status.WrongNetwork)).toBe("Switch Network");
        });
        it("should return 'Connect Wallet' for NoAccounts", () => {
            expect(Status.label(Status.NoAccounts)).toBe("Connect Wallet");
        });
        it("should return 'Accounts Ready' for Ready", () => {
            expect(Status.label(Status.Ready)).toBe("Accounts Ready");
        });
        it("should return 'Install Wallet' for null", () => {
            expect(Status.label(null)).toBe("Install Wallet");
        });
    });
});

import { describe, expect, it } from "vitest";
import { Quote } from "./quote";

describe("Quote.from", () => {
    it("should compute bid/ask/mid from a tuple", () => {
        const q = Quote.from([1000n, 900n, 1100n]);
        expect(q.bid).toBe(0.9);
        expect(q.ask).toBe(1.1);
        expect(q.mid).toBe(1);
    });
    it("should handle equal bid and ask", () => {
        const q = Quote.from([100n, 50n, 50n]);
        expect(q.bid).toBe(0.5);
        expect(q.ask).toBe(0.5);
        expect(q.mid).toBe(0.5);
    });
    it("should handle unit = 1 (no scaling)", () => {
        const q = Quote.from([1n, 3n, 5n]);
        expect(q.bid).toBe(3);
        expect(q.ask).toBe(5);
        expect(q.mid).toBe(4);
    });
    it("should handle large 18-decimal values", () => {
        const one = 10n ** 18n;
        const bid = 95n * 10n ** 16n; // 0.95
        const ask = 105n * 10n ** 16n; // 1.05
        const q = Quote.from([one, bid, ask]);
        expect(q.bid).toBe(0.95);
        expect(q.ask).toBe(1.05);
        expect(q.mid).toBe(1);
    });
    it("should handle zero bid", () => {
        const q = Quote.from([100n, 0n, 200n]);
        expect(q.bid).toBe(0);
        expect(q.ask).toBe(2);
        expect(q.mid).toBe(1);
    });
    it("should handle zero ask", () => {
        const q = Quote.from([100n, 200n, 0n]);
        expect(q.bid).toBe(2);
        expect(q.ask).toBe(0);
        expect(q.mid).toBe(1);
    });
    it("should compute mid as average of bid and ask", () => {
        const q = Quote.from([1000n, 400n, 600n]);
        expect(q.mid).toBe((q.bid + q.ask) / 2);
    });
});

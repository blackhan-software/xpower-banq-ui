import { beforeEach, describe, expect, it, vi } from "vitest";
import { offAll } from "./off-all";

describe("offAll", () => {
    let subs: Array<() => void> = [];
    beforeEach(
        () => reset()
    );
    it("unsubscribes from all", async () => {
        const items = ["item1", "item2", "item3"];
        const unsubs = await Promise.all(items.map(mock));
        expect(subs.length).toBe(3);
        offAll(unsubs);
        expect(subs.length).toBe(0);
    });
    it("handles an empty array", () => {
        const unsubs: Array<() => void> = [];
        expect(subs.length).toBe(0);
        offAll(unsubs);
        expect(subs.length).toBe(0);
    });
    function mock(_: string): Promise<() => void> {
        return new Promise((resolve) => {
            const un = vi.fn(() => {
                subs = subs.filter((sub) => sub !== un);
            });
            subs.push(un);
            resolve(un);
        });
    }
    function reset() {
        subs = [];
    }
});

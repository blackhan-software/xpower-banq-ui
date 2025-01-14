import { beforeEach, describe, expect, it, vi } from "vitest";
import { onAll } from "./on-all";

describe("onAll", () => {
    let subs: Array<() => void> = [];
    beforeEach(
        () => reset()
    );
    it("subscribes to all", async () => {
        const items = ["item1", "item2", "item3"];
        const off = await onAll(items, mock);
        expect(subs.length).toBe(3);
        off();
        expect(subs.length).toBe(0);
    });
    it("handles an empty array", async () => {
        const off = await onAll([], mock);
        expect(subs.length).toBe(0);
        off();
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

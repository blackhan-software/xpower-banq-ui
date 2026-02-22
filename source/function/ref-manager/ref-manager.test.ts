import { describe, expect, it } from "vitest";
import { RefManager } from "./ref-manager";

describe("RefManager.constructor(keyOf)", () => {
    const ref_manager = new RefManager(
        () => "",
    );
    it("should be constructable", () => {
        expect(ref_manager).toBeDefined();
    });
});
describe("RefManager.get(obj, factory)", () => {
    const ref_manager = new RefManager(
        ({ x, y }: { x: number, y: number }) => `${x}:${y}`,
    );
    it("should do-get reference", () => {
        const ref = ref_manager.get(
            { x: 1, y: 2 }, () => ({ x: 1, y: 2 }),
        );
        expect(ref).toEqual({ x: 1, y: 2 });
    });
    it("should re-get reference", () => {
        const ref = ref_manager.get(
            { x: 1, y: 2 }, () => ({ x: 0, y: 0 }),
        );
        expect(ref).toEqual({ x: 1, y: 2 });
    });
});
describe("RefManager.get(obj)", () => {
    const ref_manager = new RefManager(
        ({ x, y }: { x: number, y: number }) => `${x}:${y}`,
    );
    it("should do-get reference", () => {
        const ref = ref_manager.get(
            { x: 1, y: 2 },
        );
        expect(ref).toEqual({ x: 1, y: 2 });
    });
    it("should re-get reference", () => {
        const ref = ref_manager.get(
            { x: 1, y: 2 },
        );
        expect(ref).toEqual({ x: 1, y: 2 });
    });
});
describe("RefManager.has(obj)", () => {
    const ref_manager = new RefManager(
        ({ x, y }: { x: number, y: number }) => `${x}:${y}`,
    );
    it("shouldn't have reference", () => {
        const has_ref = ref_manager.has(
            { x: 1, y: 2 },
        );
        expect(has_ref).toEqual(false);
    });
    it("should have reference", () => {
        ref_manager.get(
            { x: 1, y: 2 }, () => ({ x: 1, y: 2 }),
        );
        const has_ref = ref_manager.has(
            { x: 1, y: 2 },
        );
        expect(has_ref).toEqual(true);
    });
});

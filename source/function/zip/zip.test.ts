import { describe, it, expect } from "vitest";
import { zip } from "./zip";

describe("zip function", () => {
    it("should zip arrays of equal length", () => {
        const array1 = [1, 2, 3];
        const array2 = ["a", "b", "c"];
        const result = zip(array1, array2);
        expect(result).toEqual([
            [1, "a", 0],
            [2, "b", 1],
            [3, "c", 2],
        ]);
    });
    it("should handle first array longer than the second", () => {
        const array1 = [1, 2, 3, 4];
        const array2 = ["x", "y"];
        const result = zip(array1, array2);
        expect(result).toEqual([
            [1, "x", 0],
            [2, "y", 1],
        ]);
    });
    it("should handle second array longer than the first", () => {
        const array1 = ["a", "b"];
        const array2 = [100, 200, 300];
        const result = zip(array1, array2);
        expect(result).toEqual([
            ["a", 100, 0],
            ["b", 200, 1],
        ]);
    });
    it("should return an empty array if one array is empty", () => {
        const array1 = [] as number[];
        const array2 = [1, 2, 3];
        const result = zip(array1, array2);
        expect(result).toEqual([]);
        const result2 = zip([1, 2, 3], []);
        expect(result2).toEqual([]);
    });
    it("should return an empty array if both arrays are empty", () => {
        const array1: number[] = [];
        const array2: string[] = [];
        const result = zip(array1, array2);
        expect(result).toEqual([]);
    });
    it("should work with arrays of different types", () => {
        const array1 = [true, false];
        const array2 = ["yes", "no"];
        const result = zip(array1, array2);
        expect(result).toEqual([
            [true, "yes", 0],
            [false, "no", 1],
        ]);
    });
});

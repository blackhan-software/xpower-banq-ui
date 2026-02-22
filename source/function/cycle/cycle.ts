export class Cycle {
    /**
     * Search for the next item in an array.
     *
     * @param array The array to search.
     * @param item The item to search for.
     * @returns The next item (or null).
     */
    static next<T>(array: T[] | null, item?: T): T | null {
        if (!array || !array.length) return null;
        if (item === undefined) item = array[0];
        const index = item !== undefined
            ? array.indexOf(item) : -1;
        if (index >= 0) {
            const next_index = index + 1;
            const next = array[next_index % array.length];
            if (next !== undefined) return next!;
        }
        return null;
    }
    /**
     * Search for the previous item in an array.
     *
     * @param array The array to search.
     * @param item The item to search for.
     * @returns The previous item (or null).
     */
    static prev<T>(array: T[] | null, item?: T): T | null {
        if (!array || !array.length) return null;
        if (item === undefined) item = array[0];
        const index = item !== undefined
            ? array.indexOf(item) : -1;
        if (index >= 0) {
            const prev_index = index - 1 + array.length;
            const prev = array[prev_index % array.length];
            if (prev !== undefined) return prev!;
        }
        return null;
    }
    /**
     * Rotate an array so that the item is first.
     *
     * @param array The array to rotate.
     * @param item The item to rotate to.
     * @returns The rotated array (or null).
     */
    static rotate<T>(array: T[] | null, item?: T): T[] | null {
        if (!array) return null;
        if (!array.length) return [];
        if (item === undefined) item = array[0];
        const index = item !== undefined
            ? array.indexOf(item) : -1;
        if (index >= 0) {
            const rhs = array.slice(0, index);
            const lhs = array.slice(index);
            return lhs.concat(rhs);
        }
        return null;
    }
}

import { describe, expect, it } from "vitest";
import { bimax } from './bimax';

describe('bimax', () => {
    it('should return minimum of 1n and 2n', () => {
        expect(bimax(1n, 2n)).toBe(2n);
    });
    it('should return minimum of 2n and 1n', () => {
        expect(bimax(2n, 1n)).toBe(2n);
    });
});

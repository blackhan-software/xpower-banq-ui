import { describe, expect, it } from "vitest";
import { bimin } from './bimin';

describe('bimin', () => {
    it('should return minimum of 1n and 2n', () => {
        expect(bimin(1n, 2n)).toBe(1n);
    });
    it('should return minimum of 2n and 1n', () => {
        expect(bimin(2n, 1n)).toBe(1n);
    });
});

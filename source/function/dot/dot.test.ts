import { describe, expect, it } from "vitest";
import { dot } from './dot';

describe('dot', () => {
    it('should add suffix if not present', () => {
        expect(dot('hello')).toBe('hello.');
    });
    it('should not add suffix if present', () => {
        expect(dot('hello.')).toBe('hello.');
    });
    it('should not add suffix if empty', () => {
        expect(dot('')).toBe('');
    });
});

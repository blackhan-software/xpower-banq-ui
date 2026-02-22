import { describe, expect, it } from "vitest";
import { cap } from './cap';

describe('cap', () => {
    it('should capitalize the first character of a string', () => {
        expect(cap('hello')).toBe('Hello');
    });

    it('should handle an already capitalized string', () => {
        expect(cap('Hello')).toBe('Hello');
    });

    it('should return an empty string if the input is empty', () => {
        expect(cap('')).toBe('');
    });

    it('should handle strings with only one character', () => {
        expect(cap('a')).toBe('A');
    });

    it('should not affect non-alphabetic first characters', () => {
        expect(cap('123abc')).toBe('123abc');
        expect(cap('!abc')).toBe('!abc');
    });

    it('should handle strings with whitespace', () => {
        expect(cap(' hello')).toBe(' hello');
    });
});

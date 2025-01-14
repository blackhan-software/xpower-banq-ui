import { describe, expect, it } from "vitest";
import { Parser } from './parser';

describe('Parser', () => {
    it('should parse false as falsy', () => {
        expect(Parser.boolean('false', true)).toBeFalsy();
    });
    it('should parse true as truthy', () => {
        expect(Parser.boolean('true', false)).toBeTruthy();
    });
    it('should parse 0 as falsy', () => {
        expect(Parser.boolean('0', true)).toBeFalsy();
    });
    it('should parse 1 as truthy', () => {
        expect(Parser.boolean('1', false)).toBeTruthy();
    });
});
describe('Parser', () => {
    it('should parse 0 as zero', () => {
        expect(Parser.number('0', NaN)).toEqual(0);
    });
    it('should parse 0.5 as half', () => {
        expect(Parser.number('0.5', NaN)).toEqual(0.5);
    });
    it('should parse 1 as one', () => {
        expect(Parser.number('1', NaN)).toEqual(1);
    });
    it('should parse 1.5 as one and half', () => {
        expect(Parser.number('1.5', NaN)).toEqual(1.5);
    });
    it('should parse 0_5 as NaN', () => {
        expect(Parser.number('0_5', NaN)).toEqual(5);
    });
    it('should parse 1_5 as fifteen', () => {
        expect(Parser.number('1_5', NaN)).toEqual(15);
    });
});

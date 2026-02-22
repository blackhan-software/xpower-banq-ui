export class Calculator {
    static log2(value: number): number {
        return Math.log2(value);
    }
    static exp2(value: number): number {
        return Math.pow(2, value);
    }
    static Log2(value: number): number {
        return Math.log2(value) + Calculator.LOG2_1E18;
    }
    static Exp2(value: number): number {
        return Math.pow(2, value - Calculator.LOG2_1E18);
    }
    static LOG2_1E18 = 59.794705_707972_522245; // Math.log2(1e18)
}
export default Calculator;

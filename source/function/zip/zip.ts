export function zip<T, U>(lhs: T[], rhs: U[]): [T, U, number][] {
    const length = Math.min(lhs.length, rhs.length);
    const result: [T, U, number][] = [];
    for (let i = 0; i < length; i++) {
        result.push([lhs[i]!, rhs[i]!, i]);
    }
    return result;
}
export default zip;

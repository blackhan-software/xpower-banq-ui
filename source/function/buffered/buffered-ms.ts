// deno-lint-ignore-file no-explicit-any
import { CancelableFunction } from "./cancelable";
/**
 * Returns a buffered and cancelable version for the provided function.
 *
 * @param fn an arbitrary function
 * @param ms delay in milliseconds
 * @returns a buffered function
 */
export function buffered_ms<F extends (...args: any[]) => any>(
    fn: F, ms = 0
) {
    let id: ReturnType<typeof setTimeout>;
    const bn = function (
        this: any, ...args: Parameters<F>
    ) {
        return new Promise((resolve) => {
            clearTimeout(id); id = setTimeout(() => resolve(
                fn ? fn.apply(this, args) : undefined
            ), ms);
        });
    };
    (bn as CancelableFunction<F>).cancel = () => {
        clearTimeout(id);
    };
    return bn as CancelableFunction<F>;
}
export default buffered_ms;

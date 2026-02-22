// deno-lint-ignore-file no-explicit-any
export interface CancelableFunction<
    F extends (...args: any[]) => any
> {
    (this: any, ...args: Parameters<F>): Promise<ReturnType<F>>;
    cancel: () => void;
}
export default CancelableFunction;

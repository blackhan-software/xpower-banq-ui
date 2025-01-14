import { StateCreator, StoreApi } from "zustand";
import { State, Action, WithAction } from "../zustand-type";

// deno-lint-ignore no-explicit-any
export type Swap<T> = StateCreator<T, [], any>
export type SwapCreator<T> = (
    set: {
        (partial: State<T>, action?: Action, replace?: false): void;
        (state: State<T, T>, action?: Action, replace?: true): void;
    },
    get: () => T,
    api: StoreApi<T>,
) => T;
/**
 * @return A middleware swapping the order of the `set`
 * function's `replace` and `action` arguments.
 */
export function withSwap<T>(creator: SwapCreator<T>): Swap<T> {
    return <Swap<T>>((set: WithAction<T>, get, api) => {
        return creator((p, a, r) => set(p, r, a), get, api);
    });
}
export default withSwap;

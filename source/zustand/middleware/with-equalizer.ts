import { StateCreator } from "zustand";
import { Action, State, StateUpdater, WithAction } from "../zustand-type";

import { polyfill } from "@/function";
polyfill(JSON.parse);

// deno-lint-ignore no-explicit-any
export type Equalizer<T> = StateCreator<T, [], any>
export type EqualizerCreator<T> = StateCreator<T>
/**
 * @return A middleware marking idempotent actions.
 */
export function withEqualizer<T>(
    creator: EqualizerCreator<T>,
) {
    return <Equalizer<T>>((
        set: WithAction<T>, get, api
    ) => {
        return creator((
            partial, replace, ...[action]: Action[]
        ) => {
            if (typed(action) && deep_eq(partial, get)) {
                action.type += "!"; // idempotent
            }
            set(partial, replace, action);
        }, get, api);
    });
}
function typed(action: unknown): action is { type: unknown } {
    if (typeof action === 'object' && action !== null) {
        return 'type' in action;
    }
    return false;
}
function deep_eq<T>(
    partial: State<T>,
    get: () => T,
) {
    const curr = get();
    const next = next_state<T>(partial, get);
    return JSON.stringify(curr) === JSON.stringify(next);
}
function next_state<T>(
    partial: State<T>,
    get: () => T,
) {
    if (callable(partial)) {
        return partial(get());
    }
    return { ...get(), ...partial };
}
function callable<T>(
    partial: State<T>,
): partial is StateUpdater<T> {
    return typeof partial === 'function';
}
export default withEqualizer;

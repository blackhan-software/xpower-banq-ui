import { StoreApi, UseBoundStore } from "zustand";

export type Store<T>
    = UseBoundStore<StoreApi<T>>;

export type State<T, P = T | Partial<T>>
    = ((state: T) => P) | P;
export type StateUpdater<T, P = T | Partial<T>>
    = ((state: T) => P);

export type Action = string | {
    [x: string | number | symbol]: unknown;
    type: string;
};
export interface WithAction<
    T,
    R = boolean,
    S = R extends true ? State<T, T> : State<T>,
> {
    (state: S, replace?: R, action?: Action): void;
}

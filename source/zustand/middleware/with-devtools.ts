import { StateCreator } from "zustand";
import { devtools, DevtoolsOptions } from "zustand/middleware";
import { withEqualizer as equalizer } from "./with-equalizer";

// deno-lint-ignore no-explicit-any
export type Devtools<T> = StateCreator<T, [], any>
export type DevtoolsCreator<T> = StateCreator<T>
export type { DevtoolsOptions };
/**
 * @return A devtools middleware with tracing.
 */
export function withDevtools<T>(
    creator: DevtoolsCreator<T>,
    options?: DevtoolsOptions,
): Devtools<T> {
    return devtools<T>(equalizer(creator), {
        ...options,
    });
}
export default withDevtools;

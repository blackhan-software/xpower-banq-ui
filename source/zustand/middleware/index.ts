import { ROParams } from "@/url";
import { create } from "zustand";
import { Store } from "../zustand-type";
import { DevtoolsOptions, withDevtools } from "./with-devtools";
import { SessionOptions, withSession } from "./with-session";
import { SwapCreator, withSwap } from "./with-swap";

type MiddlewareCreator<T> = SwapCreator<T>;
type MiddlewareOptions<T> = {
    devtools?: DevtoolsOptions;
    session?: SessionOptions<T>;
}
/**
 * @return A zustand store including middleware.
 */
export const withMiddleware = <T>(
    creator: MiddlewareCreator<T>,
    options?: MiddlewareOptions<T>,
): Store<T> => {
    let mw_swap = withSwap(creator);
    if (ROParams.withDevtools) {
        mw_swap = withDevtools(
            mw_swap, options?.devtools
        );
    }
    if (ROParams.withSession) {
        mw_swap = withSession(
            mw_swap, options?.session
        );
    }
    return create(mw_swap);
}
export default withMiddleware;

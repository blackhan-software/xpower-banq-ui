import { omit } from "@/function";
import { Nullable } from "@/type";

import { withMiddleware } from "./middleware";
import { SwapCreator } from "./middleware/with-swap";
import { withServices } from "./service";
import { stateOf } from "./state-of";

import {
    ActionsSlice, createActionsSlice,
    ErrorSlice, createErrorSlice,
    OracleSlice, createOracleSlice,
    PoolSlice, createPoolSlice,
    PortfolioSlice, createPortfolioSlice,
    TellerSlice, createTellerSlice,
    WalletSlice, createWalletSlice,
} from "./slice";

export type AppState =
    & ActionsSlice
    & ErrorSlice
    & OracleSlice
    & PoolSlice
    & PortfolioSlice
    & TellerSlice
    & WalletSlice;

export type SliceCreator<T> =
    (...a: Parameters<SwapCreator<AppState>>) => T;

const appStore = withMiddleware<AppState>((...a) => ({
    ...createActionsSlice(...a),
    ...createErrorSlice(...a),
    ...createOracleSlice(...a),
    ...createPoolSlice(...a),
    ...createPortfolioSlice(...a),
    ...createTellerSlice(...a),
    ...createWalletSlice(...a),
}), {
    session: {
        partialize(next) {
            return omit(next, [
                "actions", "errors", "teller_amount", "teller_percent",
            ]);
        },
        merge(data, next) {
            const prev = data as Nullable<AppState> | undefined;
            return { ...next, ...stateOf(prev) as AppState };
        },
    },
});
export default withServices(appStore);

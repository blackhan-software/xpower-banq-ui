import { OmitKeys } from "@/type";
import { SliceCreator } from "../app-store";

export interface ActionsSlice {
    actions: Array<OmitKeys<AppFields, "set_">>;
    reset_actions: (action: OmitKeys<AppFields, "set_">) => void;
}

/**
 * Union of all non-actions data fields (for OmitKeys)
 */
type AppFields =
    import("./oracle-slice").OracleSlice &
    import("./pool-slice").PoolSlice &
    import("./portfolio-slice").PortfolioSlice &
    import("./teller-slice").TellerSlice &
    import("./wallet-slice").WalletSlice;

export const createActionsSlice: SliceCreator<ActionsSlice> = (set) => ({
    reset_actions: (action) => set((s) => ({
        actions: s.actions.filter((a) => a !== action),
    }), {
        type: "RESET_ACTIONS", path: []
    }),
    actions: [],
});

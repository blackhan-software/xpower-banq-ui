import { ContractRunner } from "ethers";
import { AppState } from "../app-store";
import { Store } from "../zustand-type";
import { syncHealthBy } from "./sync-health-by";

/**
 * @return A zustand store w/a sync-health service.
 */
export function syncPortfolioHealth(
    store: Store<AppState>, { runner }: {
        runner: ContractRunner;
    },
) {
    store = syncHealthBy(store, {
        runner, position_of: 'supplyOf'
    });
    store = syncHealthBy(store, {
        runner, position_of: 'borrowOf'
    });
    return store;
}
export default syncPortfolioHealth;

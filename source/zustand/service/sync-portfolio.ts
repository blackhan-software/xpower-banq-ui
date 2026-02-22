import { ContractRunner } from "ethers";
import { AppState } from "../app-store";
import { Store } from "../zustand-type";
import { syncPortfolioBy } from "./sync-portfolio-by";

/**
 * @return A zustand store w/a sync-position service.
 */
export function syncPortfolioSupply(
    store: Store<AppState>, { runner }: {
        runner: ContractRunner,
    },
) {
    return syncPortfolioBy(store, {
        runner, position_of: 'supplyOf'
    });
}
/**
 * @return A zustand store w/a sync-position service.
 */
export function syncPortfolioBorrow(
    store: Store<AppState>, { runner }: {
        runner: ContractRunner,
    },
) {
    return syncPortfolioBy(store, {
        runner, position_of: 'borrowOf'
    });
}

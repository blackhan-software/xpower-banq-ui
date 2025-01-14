import { RemoteProvider } from "@/blockchain";
import { assert } from "@/function";
import { AppState } from "../app-store";
import { Store } from "../zustand-type";

import { syncPortfolioAmount } from "./sync-amount";
import { syncPortfolioBorrow } from "./sync-borrow";
import { syncPortfolioHealth } from "./sync-health";
import { syncPortfolioLimits } from "./sync-limits";
import { syncPortfolioSupply } from "./sync-supply";
import { syncPortfolioYields } from "./sync-yields";

/**
 * @return A zustand store sync services.
 */
export function withSync(
    store: Store<AppState>,
) {
    const provider = RemoteProvider();
    assert(provider, "missing provider");
    store = syncPortfolioAmount(store, { runner: provider });
    store = syncPortfolioSupply(store, { runner: provider });
    store = syncPortfolioBorrow(store, { runner: provider });
    store = syncPortfolioHealth(store, { runner: provider });
    store = syncPortfolioLimits(store, { runner: provider });
    store = syncPortfolioYields(store, { runner: provider });
    return store;
}
export default withSync;

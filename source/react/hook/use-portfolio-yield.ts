import { appStore } from "@/zustand";
import { useOracleQuote } from "./use-oracle-quote";
import { usePoolAccount } from "./use-pool-account";

export function usePortfolioYield() {
    const [pool_account] = usePoolAccount();
    const [portfolio_yields] = usePortfolioYields();
    ///
    const apy = portfolio_yields?.get(pool_account);
    if (!apy) return [null] as const;
    return [apy] as const;
}
function usePortfolioYields() {
    let { portfolio_yields, set_portfolio_yields } = appStore();
    if (portfolio_yields instanceof Array) {
        portfolio_yields = new Map(portfolio_yields);
    }
    useOracleQuote(); // initialize pool's oracle-quote(s)
    return [portfolio_yields, set_portfolio_yields] as const;
}
export default usePortfolioYield;

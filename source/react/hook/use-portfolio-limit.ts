import { usePoolAccount, usePortfolioCap, useTellerToken } from "@/react/hook";
import { Limit } from "@/type";
import { appStore } from "@/zustand";

export function usePortfolioLimit() {
    const [token] = useTellerToken();
    const [pool_account] = usePoolAccount();
    const [limit_map] = usePortfolioLimits();
    const [cap] = usePortfolioCap();
    ///
    if (!cap) return [null] as const;
    const limits = limit_map?.get(pool_account);
    if (!limits) return [null] as const;
    const limit = Limit.findBy(limits, token);
    if (!limit) return [null] as const;
    const value = Math.min(cap[0], limit.amount);
    return [value] as const;
}
function usePortfolioLimits() {
    let { portfolio_limits, set_portfolio_limits } = appStore();
    if (portfolio_limits instanceof Array) {
        portfolio_limits = new Map(portfolio_limits);
    }
    return [portfolio_limits, set_portfolio_limits] as const;
}
export default usePortfolioLimit;

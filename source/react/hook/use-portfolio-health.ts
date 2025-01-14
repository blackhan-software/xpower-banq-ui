import { PoolContract } from "@/contract";
import { assert, addressOf as x } from "@/function";
import { usePoolAccount, usePoolContract } from "@/react/hook";
import { Health, PoolAccount } from "@/type";
import { appStore } from "@/zustand";
import { useQuery } from "@tanstack/react-query";

export function usePortfolioHealth() {
    const [pool_account] = usePoolAccount();
    const [portfolio_health] = usePortfolioHealths();
    ///
    const health = portfolio_health?.get(pool_account);
    if (!health) return [null] as const;
    return [health] as const;
}
function usePortfolioHealths() {
    let { portfolio_health, set_portfolio_health } = appStore();
    if (portfolio_health instanceof Array) {
        portfolio_health = new Map(portfolio_health);
    }
    const [pool_contract] = usePoolContract();
    const [pool_account] = usePoolAccount();
    useQuery({
        queryKey: [
            "portfolio-health",
            pool_contract?.target,
            x(pool_account.account),
        ],
        queryFn: async () => {
            assert(pool_contract, "missing pool");
            const health = await health_of(
                pool_account, pool_contract,
            );
            const new_map = new Map(portfolio_health);
            new_map.set(pool_account, health);
            set_portfolio_health(new_map)
            return new_map;
        },
        enabled: Boolean(
            pool_contract?.target &&
            pool_account.account
        ),
    });
    return [portfolio_health, set_portfolio_health] as const;
}
async function health_of(
    { account }: PoolAccount,
    pool_contract: PoolContract,
): Promise<Health> {
    return Health.from(
        await pool_contract.healthOf(x(account))
    );
}
export default usePortfolioHealth;

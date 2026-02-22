import { useAmountPositions, usePoolAccount, usePortfolioLimit, useTellerMode, useTellerToken } from "@/react/hook";
import { Mode, Position } from "@/type";

export function usePortfolioAmount() {
    const [mode] = useTellerMode();
    const [token] = useTellerToken();
    const [pool_account] = usePoolAccount();
    const [position_map] = useAmountPositions();
    ///
    const ps = position_map?.get(pool_account);
    if (!ps?.length) return [null] as const;
    const p = Position.findBy(ps, token);
    if (!p) return [null] as const;
    const value = Math.min(
        Position.cap(p, mode)[0],
        Position.amount(p),
    );
    return [value] as const;
}
export function usePortfolioAmountRange(
    mode: Mode,
) {
    const [limit] = usePortfolioLimit();
    const [balance] = usePortfolioAmount();
    if (mode === Mode.supply && balance !== null) {
        return [0, balance, balance / 100] as const;
    }
    if (mode === Mode.borrow && limit !== null) {
        return [0, limit, limit / 100] as const;
    }
    return [0, 0, 0] as const;
}
export default usePortfolioAmount;

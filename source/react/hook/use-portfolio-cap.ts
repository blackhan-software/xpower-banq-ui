import { useAmountPositions, usePoolAccount, useTellerMode, useTellerToken } from "@/react/hook";
import { Position } from "@/type";

export function usePortfolioCap() {
    const [mode] = useTellerMode();
    const [token] = useTellerToken();
    const [pool_account] = usePoolAccount();
    const [position_map] = useAmountPositions();
    ///
    const ps = position_map?.get(pool_account);
    if (!ps?.length) return [null] as const;
    const p = Position.findBy(ps, token);
    if (!p) return [null] as const;
    return [Position.cap(p, mode)] as const;
}
export default usePortfolioCap;

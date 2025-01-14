import { usePortfolioAmount, usePortfolioLimit, useWalletAccount } from "@/react/hook";
import { Amount, Mode, Percent } from "@/type";
import { AppState, appStore } from "@/zustand";
import { useEffect } from "react";

export function useTellerAmount(
    mode: Mode,
) {
    const { teller_amount, set_teller_amount } = appStore();
    const { teller_percent: teller_percent } = appStore();
    const { actions, reset_actions } = appStore();
    ///
    const [balance] = usePortfolioAmount();
    const [account] = useWalletAccount();
    const [limit] = usePortfolioLimit();
    useEffect(() => {
        const guard = noop_reset(actions);
        if (guard) {
            reset_actions("teller_amount");
            return; // avoid recursion
        }
        let amount: Amount | null = null;
        if (mode === Mode.supply) {
            amount = amount_of(balance, teller_percent);
        }
        if (mode === Mode.borrow) {
            amount = amount_of(limit, teller_percent);
        }
        if (amount !== teller_amount &&
            amount !== null
        ) {
            set_teller_amount(amount);
            return;
        }
        if (!account && amount !== null) {
            set_teller_amount(null);
        }
    }, [
        teller_percent,
        teller_amount,
        account,
        balance,
        limit,
        mode,
    ]);
    return [teller_amount, set_teller_amount] as const;
}
/**
 * @returns recursion guard and action-path reset flag.
 */
function noop_reset(
    actions: AppState["actions"],
) {
    if (actions.at(-1) === "teller_token") {
        return false;
    }
    return actions.includes("teller_amount");
}
function amount_of(
    amount_max: Amount | null,
    percent: Percent | null,
) {
    if (amount_max !== null && percent !== null) {
        return amount_max * percent / 100;
    }
    return null;
}
export default useTellerAmount;

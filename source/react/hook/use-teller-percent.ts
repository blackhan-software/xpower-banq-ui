import { usePortfolioAmount, usePortfolioLimit, useWalletAccount, useWalletAccountSync } from "@/react/hook";
import { Amount, Mode, Rate } from "@/type";
import { AppState, appStore } from "@/zustand";
import { useEffect } from "react";

export function useTellerPercent(
    mode: Mode,
) {
    const { teller_percent, set_teller_percent, teller_amount, actions, reset_actions } = appStore();
    ///
    const [balance] = usePortfolioAmount();
    const [account] = useWalletAccount();
    const [limit] = usePortfolioLimit();
    useWalletAccountSync(account);
    useEffect(() => {
        const guard = noop_reset(actions);
        if (guard) {
            reset_actions("teller_percent");
            return; // avoid recursion
        }
        let percent: Rate | null = null;
        if (mode === Mode.supply) {
            percent = percent_of(balance, teller_amount);
        }
        if (mode === Mode.borrow) {
            percent = percent_of(limit, teller_amount);
        }
        if (percent !== teller_percent &&
            percent !== null
        ) {
            set_teller_percent(percent);
        }
        if (!account && percent !== 0) {
            set_teller_percent(0);
        }
    }, [
        teller_percent,
        teller_amount,
        account,
        balance,
        limit,
        mode,
    ]);
    return [teller_percent, set_teller_percent] as const;
}
/**
 * @returns recursion guard and action-path reset flag.
 */
function noop_reset(
    actions: AppState["actions"],
) {
    if (actions.at(-1) === "teller_token") {
        return true;
    }
    if (actions.at(-1) === "teller_mode") {
        return true;
    }
    if (actions.at(-1) === "portfolio_amount") {
        return true;
    }
    if (actions.at(-1) === "portfolio_limits") {
        return true;
    }
    if (actions.at(-1) === "wallet_account") {
        return true;
    }
    return actions.includes("teller_percent");
}
function percent_of(
    amount_max: Amount | null,
    amount: Amount | null,
) {
    if (amount !== null && amount_max !== null && amount_max > 0) {
        const pct_value = 100.0 * amount / amount_max;
        const min_value = Math.min(100, pct_value);
        const max_value = Math.max(0, min_value);
        return max_value;
    }
    return null;
}
export default useTellerPercent;

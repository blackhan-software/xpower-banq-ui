import { VaultFee as Fee } from "@/contract";
import Address from "./address";

export type VaultFee = {
    /** entry fee of vault (basis points: 1e14) */
    entry: number;
    /** entry fee recipient */
    entryRecipient: Address;
    /** exit fee of vault (basis points: 1e14) */
    exit: number;
    /** exit fee recipient */
    exitRecipient: Address;
}
export const VaultFee = {
    from(fee: Fee): VaultFee {
        return {
            entry: Number(fee.entry),
            entryRecipient: fee.entryRecipient,
            exit: Number(fee.exit),
            exitRecipient: fee.exitRecipient,
        };
    },
    percent(fee: number | bigint): number {
        return 1e2 * Number(fee) / 1e18;
    },
    permille(fee: number | bigint): number {
        return 1e3 * Number(fee) / 1e18;
    }
};

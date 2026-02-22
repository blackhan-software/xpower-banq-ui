import { Account } from "@/type";
import { SliceCreator } from "../app-store";
import { add } from "../zustand-util";

export interface WalletSlice {
    set_wallet_account: (account: Account | null) => void;
    wallet_account: Account | null;
}
export const createWalletSlice: SliceCreator<WalletSlice> = (set) => ({
    set_wallet_account: (a) => set((s) => ({
        actions: add(s.actions, "wallet_account"),
        wallet_account: a,
    }), {
        type: "WALLET_ACCOUNT", account: a
    }),
    wallet_account: null,
});

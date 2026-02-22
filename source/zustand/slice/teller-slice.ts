import { Amount, Mode, Percent, Token } from "@/type";
import { RWParams } from "@/url";
import { SliceCreator } from "../app-store";
import { add } from "../zustand-util";

export interface TellerSlice {
    set_teller_percent: (percent: Percent | null) => void;
    teller_percent: Percent | null;
    set_teller_amount: (amount: Amount | null) => void;
    teller_amount: Amount | null;
    set_teller_token: (token: Token) => void;
    teller_token: Token;
    set_teller_mode: (mode: Mode) => void;
    teller_mode: Mode;
    set_teller_flag: (flag: boolean) => void;
    teller_flag: boolean;
}
export const createTellerSlice: SliceCreator<TellerSlice> = (set) => ({
    set_teller_percent: (p) => set((s) => ({
        actions: add(s.actions, "teller_percent"),
        teller_percent: p,
    }), {
        type: "TELLER_PERCENT", percent: p
    }),
    teller_percent: 0,
    set_teller_amount: (a) => set((s) => ({
        actions: add(s.actions, "teller_amount"),
        teller_amount: a,
    }), {
        type: "TELLER_AMOUNT", amount: a
    }),
    teller_amount: null,
    set_teller_token: (t) => set((s) => ({
        actions: add(s.actions, "teller_token"),
        teller_token: t
    }), {
        type: "TELLER_TOKEN", token: t
    }),
    teller_token: RWParams.token,
    set_teller_mode: (m) => set((s) => ({
        actions: add(s.actions, "teller_mode"),
        teller_mode: m
    }), {
        type: "TELLER_MODE", mode: m
    }),
    teller_mode: RWParams.mode,
    set_teller_flag: (f) => set((s) => ({
        actions: add(s.actions, "teller_flag"),
        teller_flag: f
    }), {
        type: "TELLER_FLAG", flag: f
    }),
    teller_flag: RWParams.portfolio,
});

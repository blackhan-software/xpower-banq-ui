import { Health, Limit, Position, Rate } from "@/type";
import { PoolAccount } from "@/type/pool-account";
import { SliceCreator } from "../app-store";
import { add } from "../zustand-util";

export interface PortfolioSlice {
    set_portfolio_amount: (amount: Map<PoolAccount, Position[]> | null) => void;
    portfolio_amount: Map<PoolAccount, Position[]> | null;
    set_portfolio_limits: (apy: Map<PoolAccount, Limit[]> | null) => void;
    portfolio_limits: Map<PoolAccount, Limit[]> | null;
    set_portfolio_supply: (supply: Map<PoolAccount, Position[]> | null) => void;
    portfolio_supply: Map<PoolAccount, Position[]> | null;
    set_portfolio_borrow: (borrow: Map<PoolAccount, Position[]> | null) => void;
    portfolio_borrow: Map<PoolAccount, Position[]> | null;
    set_portfolio_health: (health: Map<PoolAccount, Health> | null) => void;
    portfolio_health: Map<PoolAccount, Health> | null;
    set_portfolio_yields: (apy: Map<PoolAccount, Rate> | null) => void;
    portfolio_yields: Map<PoolAccount, Rate> | null;
}
export const createPortfolioSlice: SliceCreator<PortfolioSlice> = (set) => ({
    set_portfolio_amount: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_amount"),
        portfolio_amount: m
    }), {
        type: "PORTFOLIO_AMOUNT", amount: m
    }),
    portfolio_amount: null,
    set_portfolio_limits: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_limits"),
        portfolio_limits: m
    }), {
        type: "PORTFOLIO_LIMITS", limits: m
    }),
    portfolio_limits: null,
    set_portfolio_supply: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_supply"),
        portfolio_supply: m
    }), {
        type: "PORTFOLIO_SUPPLY", supply: m
    }),
    portfolio_supply: null,
    set_portfolio_borrow: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_borrow"),
        portfolio_borrow: m
    }), {
        type: "PORTFOLIO_BORROW", borrow: m
    }),
    portfolio_borrow: null,
    set_portfolio_health: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_health"),
        portfolio_health: m
    }), {
        type: "PORTFOLIO_HEALTH", health: m
    }),
    portfolio_health: null,
    set_portfolio_yields: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_yields"),
        portfolio_yields: m
    }), {
        type: "PORTFOLIO_YIELD", yield: m
    }),
    portfolio_yields: null,
});

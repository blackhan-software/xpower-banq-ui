import { PoolContract, PositionContract, ERC20Contract } from "@/contract";
import { assert, addressOf as x } from "@/function";
import { usePoolAccount, usePoolContract, usePositionContracts, useTokenContracts } from "@/react/hook";
import { Account, Mode, Nullable, PoolAccount, PoolToken, Position, Symbol } from "@/type";
import { appStore } from "@/zustand";
import { useQuery } from "@tanstack/react-query";

type Portfolio = readonly [
    Position[] | null,
];
type Positions = readonly [
    Map<PoolAccount, Position[]> | null,
    (positions: Map<PoolAccount, Position[]> | null) => void,
];
export function usePortfolio(mode: Mode): Portfolio {
    const [pool_account] = usePoolAccount();
    const [supply] = useSupplyPositions();
    const [borrow] = useBorrowPositions();
    switch (mode) {
        case Mode.supply:
            return [supply?.get(pool_account) ?? null] as const;
        case Mode.borrow:
            return [borrow?.get(pool_account) ?? null] as const;
    }
}
export function useAmountPositions(): Positions {
    const { portfolio_amount: amount, set_portfolio_amount: set_amount } = appStore();
    const [contract] = useTokenContracts(); // of pool
    return portfolio([amount, set_amount], contract);
}
export function useSupplyPositions(): Positions {
    const { portfolio_supply: supply, set_portfolio_supply: set_supply } = appStore();
    const [contracts] = usePositionContracts(Mode.supply);
    return portfolio([supply, set_supply], contracts);
}
export function useBorrowPositions(): Positions {
    const { portfolio_borrow: borrow, set_portfolio_borrow: set_borrow } = appStore();
    const [contracts] = usePositionContracts(Mode.borrow);
    return portfolio([borrow, set_borrow], contracts);
}
function portfolio(
    [state, set_state]: Positions,
    position_contracts: null | Map<
        PoolToken, ERC20Contract | PositionContract
    >,
) {
    if (state instanceof Array) {
        state = new Map(state);
    }
    const [token_contracts] = useTokenContracts();
    const [pool_contract] = usePoolContract();
    const [pool_account] = usePoolAccount();
    const args: Nullable<Args> = [
        token_contracts, position_contracts, pool_account,
    ];
    useQuery({
        queryKey: [
            "portfolio",
            x(pool_account.account),
            ...position_contracts?.values().map((p) => p.target) ?? [],
        ],
        queryFn: async () => {
            const positions = await init_all(
                args as Args, pool_contract as PoolContract
            );
            const new_map = new Map(state);
            new_map.set(pool_account, positions);
            set_state(new_map);
            return new_map;
        },
        enabled: Boolean(
            pool_account.account &&
            position_contracts &&
            pool_contract
        ),
    });
    return [state, set_state] as const;
};
type Args = [
    Map<PoolToken, ERC20Contract>,
    Map<PoolToken, ERC20Contract | PositionContract>,
    PoolAccount,
];
function init_all(
    [token_contracts, ...rest]: Args,
    pool_contract: PoolContract,
) {
    const init = init_one([token_contracts, ...rest], pool_contract);
    return Promise.all(token_contracts.keys().map(init));
}
function init_one(
    [token_contracts, position_contracts, { account }]: Args,
    pool_contract: PoolContract,
): (pt: PoolToken) => Promise<Position> {
    const position_num = async (pt: PoolToken) => {
        const p = await position_big(pt);
        return {
            address: pt.token.address,
            amount: p.amount,
            capTotal: {
                supply: [p.cap_supply, p.cap_supply_dt] as [bigint, bigint],
                borrow: [p.cap_borrow, p.cap_borrow_dt] as [bigint, bigint],
            },
            cap: {
                supply: [p.cup_supply, p.cup_supply_dt] as [bigint, bigint],
                borrow: [p.cup_borrow, p.cup_borrow_dt] as [bigint, bigint],
            },
            decimals: p.decimals,
            lockedTotal: p.lockedTotal,
            locked: p.locked,
            supply: p.supply,
            symbol: p.symbol,
        }
    };
    const position_big = async (pt: PoolToken) => {
        const tc = token_contracts.get(pt);
        assert(tc, "missing token-contract");
        const pc = position_contracts.get(pt);
        assert(pc, "missing position-contract");
        const [
            [cup_supply, cup_supply_dt],
            [cap_supply, cap_supply_dt],
            [cup_borrow, cup_borrow_dt],
            [cap_borrow, cap_borrow_dt],
            locked, lockedTotal,
            amount, decimals,
            supply, symbol,
        ] = await Promise.all([
            pool_contract.capSupplyOf(x(account), pt.token.address),
            pool_contract.capSupply(pt.token.address),
            pool_contract.capBorrowOf(x(account), pt.token.address),
            pool_contract.capBorrow(pt.token.address),
            lock_of(pc, account), lock_of(pc, 0n),
            amount_of(pc, account), pc.decimals(),
            pc.totalSupply(), tc.symbol(),
        ]);
        return {
            symbol: Symbol.cast(symbol),
            cap_supply, cap_supply_dt,
            cup_supply, cup_supply_dt,
            cap_borrow, cap_borrow_dt,
            cup_borrow, cup_borrow_dt,
            amount, decimals, supply,
            lockedTotal, locked,
        };
    };
    return position_num;
}
function amount_of(
    contract: ERC20Contract | PositionContract,
    account: Account,
) {
    if (contract instanceof PositionContract) {
        return contract.totalOf(x(account));
    }
    return contract.balanceOf(x(account));
}
function lock_of(
    contract: ERC20Contract | PositionContract,
    account: Account,
) {
    if (contract instanceof PositionContract) {
        return contract.lockOf(x(account));
    }
    return Promise.resolve(0n);
}
export default usePortfolio;

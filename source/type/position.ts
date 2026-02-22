import { U224 } from "@/constant";
import { Address, Amount, Mode, Seconds, Token } from "@/type";
import { parseUnits } from "ethers";

export type Position = Token & {
    capTotal: Record<Mode, [bigint, bigint]>;
    cap: Record<Mode, [bigint, bigint]>;
    lockedTotal: bigint;
    locked: bigint;
    amount: bigint;
};
export const Position = {
    amount(position: Position, amount?: bigint): Amount {
        const lhs = Number(amount ?? position.amount);
        const rhs = Number(10n ** position.decimals);
        return lhs / rhs;
    },
    big: (position: Position, amount: Amount): bigint => {
        const amount_fix = amount.toFixed(Number(position.decimals));
        return parseUnits(amount_fix, position.decimals);
    },
    capTotal(position: Position, mode: Mode): [Amount, Seconds] {
        const [limit, dt] = position.capTotal[mode];
        if (limit >= U224) return [Infinity, Number(dt)];
        return [
            Number(limit) / Number(10n ** position.decimals),
            Number(dt), // cap-duration in seconds
        ];
    },
    cap(position: Position, mode: Mode): [Amount, Seconds] {
        const [limit, dt] = position.cap[mode];
        if (limit >= U224) return [Infinity, Number(dt)];
        return [
            Number(limit) / Number(10n ** position.decimals),
            Number(dt), // cap-duration in seconds
        ];
    },
    lockedTotal(position: Position, locked?: bigint): Amount {
        const lhs = Number(locked ?? position.lockedTotal);
        const rhs = Number(10n ** position.decimals);
        return lhs / rhs;
    },
    locked(position: Position, locked?: bigint): Amount {
        const lhs = Number(locked ?? position.locked);
        const rhs = Number(10n ** position.decimals);
        return lhs / rhs;
    },
    findBy(positions: Position[], { address }: Token) {
        return positions.find((p) => p.address === address);
    },
    from: (address: Address): Position => ({
        ...Token.from(address),
        capTotal: { supply: [0n, 0n], borrow: [0n, 0n] },
        cap: { supply: [0n, 0n], borrow: [0n, 0n] },
        lockedTotal: 0n,
        locked: 0n,
        amount: 0n,
    }),
    sum: (positions: Position[]): Amount => Number(
        positions.reduce((acc, p) => acc + p.amount, 0n)
    ),
    supply(position: Position): Amount {
        return Number(position.supply) / Number(10n ** position.decimals);
    },
    eq: (lhs?: Position[], rhs?: Position[]): boolean =>
        JSON.stringify(lhs) === JSON.stringify(rhs),
}
export default Position;

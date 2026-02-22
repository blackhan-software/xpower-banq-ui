import { Amount, Token } from "@/type";

export type Limit = {
    amount: Amount;
    token: Token;
}
export const Limit = {
    findBy: (limits: Limit[], { address }: Token) =>
        limits.find(({ token: t }) => t.address === address),
    sum: (limits: Limit[]) => limits.reduce(
        (acc, l) => acc + l.amount, 0),
    checksum: (limits: Limit[]) => limits.reduce(
        (acc, l, i) => (acc + (1 + l.amount) * (1 + i)) % 0xffffffff, 0),
    eq: (lhs_limits?: Limit[], rhs_limits?: Limit[]) =>
        Limit.checksum(lhs_limits ?? []) === Limit.checksum(rhs_limits ?? []),
}
export default Limit;

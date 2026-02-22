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
    eq: (lhs?: Limit[], rhs?: Limit[]): boolean =>
        JSON.stringify(lhs) === JSON.stringify(rhs),
}
export default Limit;

export type Account = bigint;
export const Account = {
    of(addresses: string[]): Account[] {
        return addresses.map((a) => BigInt(a));
    }
}
export default Account;

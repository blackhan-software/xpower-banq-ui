import { usePool, useWalletAccount } from "@/react/hook";
import { PoolAccount } from "@/type";

export function usePoolAccount() {
    const [pool] = usePool();
    const [account] = useWalletAccount();
    return [PoolAccount.from(pool, account ?? 0n)] as const;
}
export default usePoolAccount;

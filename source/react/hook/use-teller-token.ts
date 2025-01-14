import { usePool } from "@/react/hook";
import { Pool, PoolList, Token } from "@/type";
import { RWParams } from "@/url";
import { appStore } from "@/zustand";
import { useEffect } from "react";

export function useTellerToken() {
    const { teller_token, set_teller_token } = appStore();
    ///
    const [pool] = usePool();
    useEffect(() => {
        const prev_pool = PoolList.prev(pool) ?? pool;
        const token_1st = Pool.token(prev_pool, 0);
        if (teller_token.address !== token_1st) {
            const token_2nd = Pool.token(pool, 1);
            if (token_2nd) {
                const token = Token.from(token_2nd);
                if (token.address !== teller_token?.address) {
                    set_teller_token(token);
                    RWParams.token = token;
                }
            }
        }
    }, [
        pool,
    ]);
    return [teller_token, set_teller_token] as const;
}
export default useTellerToken;

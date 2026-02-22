import { usePool } from "@/react/hook";
import { Pool, Token } from "@/type";
import { RWParams } from "@/url";
import { appStore } from "@/zustand";
import { useEffect, useRef } from "react";

export function useTellerToken() {
    const { teller_token, set_teller_token } = appStore();
    ///
    const [pool] = usePool();
    const ref = useRef(pool);
    useEffect(() => {
        const prev_pool = ref.current;
        const pool_tokens = Pool.tokens(pool);
        // if pool changed, validate curr. token
        if (prev_pool !== pool && pool_tokens) {
            const has_token = pool_tokens.some(
                (a) => a === teller_token.address
            );
            if (!has_token) {
                // invalid token for new pool, try to maintain rel. position
                const prev_tokens = Pool.tokens(prev_pool);
                let token_idx = 0;
                if (prev_tokens) {
                    // find index of curr. token in prev. pool
                    token_idx = prev_tokens.findIndex(
                        (a) => a === teller_token.address
                    );
                    // if missing in prev. pool, default to 0
                    if (token_idx < 0) {
                        token_idx = 0;
                    }
                }
                // try to get token at same index in new pool, or fallback to first
                const new_token = Pool.token(pool, token_idx) ?? Pool.token(pool, 0);
                if (new_token) {
                    const token = Token.from(new_token);
                    set_teller_token(token);
                    RWParams.token = token;
                }
            }
            // update prev. pool ref for next comparison
            ref.current = pool;
        }
    }, [
        pool, teller_token,
    ]);
    return [teller_token, set_teller_token] as const;
}
export default useTellerToken;

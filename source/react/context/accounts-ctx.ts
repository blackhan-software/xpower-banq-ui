import { createContext } from "react";
import { Account } from "@/type";

export const AccountsCtx = createContext<null | [
    null | Account[], () => Promise<void>
]>(
    null
);
export default AccountsCtx;

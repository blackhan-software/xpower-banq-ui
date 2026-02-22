import { Status } from "@/blockchain";
import { createContext } from "react";

export const WalletStatusCtx = createContext<null | [
    null | Status, (status: Status | null) => void,
]>(
    null
);
export default WalletStatusCtx;

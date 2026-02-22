import { ChainId } from "@/blockchain";
import { createContext } from "react";

export const ChainIdCtx = createContext<null | [
    null | ChainId, (id: ChainId | null) => Promise<void>,
]>(
    null
);
export default ChainIdCtx;

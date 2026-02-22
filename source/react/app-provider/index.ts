import {
    AccountsPro,
    ChainIdPro,
    WalletStatusPro,
} from "@/react/context";
import { combine } from "./combine";

export const AppProvider = combine(
    ChainIdPro, // connected chain-id
    AccountsPro, // connected account(s)
    WalletStatusPro, // wallet status
);
export default AppProvider;

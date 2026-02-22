import { Ethereum } from "@/blockchain";

type AddressList = string[];
type ChainId = string;

/**
 * @see https://docs.metamask.io/wallet/reference/json-rpc-methods/eth_accounts/
 */
export async function eth_accounts(
    ethereum: Ethereum | undefined,
): Promise<AddressList | null> {
    const accounts = await ethereum?.request<string[]>({
        method: "eth_accounts",
    });
    if (accounts && accounts.length > 0) {
        return accounts;
    }
    return null;
}
/**
 * @see https://docs.metamask.io/wallet/reference/json-rpc-methods/eth_requestaccounts/
 */
export async function eth_requestAccounts(
    ethereum: Ethereum | undefined,
): Promise<AddressList | null> {
    const accounts = await ethereum?.request<string[]>({
        method: "eth_requestAccounts",
    });
    if (accounts && accounts.length > 0) {
        return accounts;
    }
    return null;
}
/**
 * @see https://docs.metamask.io/wallet/reference/json-rpc-methods/eth_chainid/
 */
export async function eth_chainId(
    ethereum: Ethereum | undefined,
): Promise<ChainId | null> {
    const chain_id = await ethereum?.request<string>({
        method: "eth_chainId",
    });
    if (chain_id) {
        return chain_id;
    }
    return null;
}

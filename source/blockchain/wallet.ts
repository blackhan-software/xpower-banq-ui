import { Ethereum } from "@/blockchain";

type Error = {
    code: number;
    message: string;
};
type AddEthereumChainResult = null;
type AddEthereumChainParameter = {
    chainId: string;
    chainName: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    iconUrls?: string[];
    blockExplorerUrls?: string[];
};
type SwitchEthereumChainResult = null;
type SwitchEthereumChainParameter = {
    chainId: string;
};

/**
 * @see https://docs.metamask.io/wallet/reference/json-rpc-methods/wallet_addethereumchain/
 */
export async function wallet_addEthereumChain(
    ethereum: Ethereum | undefined,
    params: AddEthereumChainParameter,
): Promise<AddEthereumChainResult | Error> {
    const error = await ethereum?.request<
        AddEthereumChainResult | Error
    >({
        method: "wallet_addEthereumChain",
        params: [params],
    });
    if (error) {
        return error;
    }
    return null;
}
/**
 * @see https://docs.metamask.io/wallet/reference/json-rpc-methods/wallet_switchethereumchain/
 */
export async function wallet_switchEthereumChain(
    ethereum: Ethereum | undefined,
    params: SwitchEthereumChainParameter,
): Promise<SwitchEthereumChainResult | Error> {
    const error = await ethereum?.request<
        SwitchEthereumChainResult | Error
    >({
        method: "wallet_switchEthereumChain",
        params: [params],
    });
    if (error) {
        return error;
    }
    return null;
}

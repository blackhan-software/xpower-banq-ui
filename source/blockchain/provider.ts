import { Ethereum, ethereum } from "@/blockchain";
import { WSProvider } from "@/blockchain/ws-provider";
import { PROVIDER_URL } from "@/constant";
import { memoized, random } from "@/function";
import detectProvider from "@metamask/detect-provider";
import { BrowserProvider, JsonRpcProvider } from "ethers";

export type RemoteProviderOptions = Pick<
    ProviderOptions, "polling_ms" | "url"
>;
export type WalletProviderOptions = Omit<
    ProviderOptions, "url"
>;
export type ProviderOptions = {
    mm_provider: Ethereum | null;
    polling_ms: number;
    url: string;
};
export function RemoteProvider(
    options?: Partial<RemoteProviderOptions>,
) {
    return Provider({
        ...options, url: options?.url ?? PROVIDER_URL
    });
}
export async function WalletProvider(
    options?: Partial<WalletProviderOptions>,
) {
    const pro = ethereum ?? await detectProvider<Ethereum>();
    return Provider({ mm_provider: pro, ...options });
}
/**
 * Get a *cached* provider for the given options.
 */
export const Provider = memoized((
    options?: Partial<ProviderOptions>,
) => {
    const [mm_provider, polling_ms, url] = [
        options?.mm_provider ?? ethereum,
        options?.polling_ms ?? 2000,
        options?.url,
    ];
    if (url === undefined && mm_provider) {
        const pro = new BrowserProvider(mm_provider);
        pro.pollingInterval = polling_ms;
        return pro;
    }
    if (url?.match(/^http/i)) {
        const pro = new JsonRpcProvider(x_code(url));
        pro.pollingInterval = polling_ms;
        return pro;
    }
    if (url?.match(/^ws/i)) {
        return ws_provider({ url: x_code(url), polling_ms });
    }
    return null;
}, (options) => {
    return JSON.stringify({
        mm_provider: Boolean(options?.mm_provider),
        polling_ms: options?.polling_ms,
        url: options?.url,
    });
});
/**
 * Get a websocket provider for the given options.
 */
let ws_instance: WSProvider | null = null;
function ws_provider(
    { polling_ms, url }: RemoteProviderOptions,
) {
    ws_instance?.dispose();
    ws_instance = new WSProvider(url, polling_ms);
    return ws_instance.provider;
}
/**
 * Append a random code to the given URL.
 */
function x_code(url: string): string {
    const uri = new URL(url);
    if (uri.searchParams.has('x-code') === false) {
        uri.searchParams.set('x-code', random(4));
    }
    return uri.toString();
}
export default Provider;

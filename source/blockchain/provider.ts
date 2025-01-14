import { Ethereum, ethereum } from "@/blockchain";
import { PROVIDER_URL } from "@/constant";
import { memoized, random } from "@/function";
import detectProvider from "@metamask/detect-provider";
import { BrowserProvider, JsonRpcProvider, WebSocketProvider } from "ethers";

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
function ws_provider(
    { polling_ms, url }: RemoteProviderOptions,
) {
    const pro = new WebSocketProvider(url);
    pro.once("block", /* keep-alive */() => {
        if (WS_PROVIDER_IID[url]) {
            clearInterval(WS_PROVIDER_IID[url]);
            delete WS_PROVIDER_IID[url];
        }
        WS_PROVIDER_IID[url] = setInterval(async () => {
            const tid = setTimeout(/* reset */() => {
                clearInterval(WS_PROVIDER_IID[url]);
                location.reload();
            }, polling_ms);
            const n = await pro.getBlockNumber();
            console.assert(n, "missing block");
            clearTimeout(tid);
        }, polling_ms);
    });
    return pro;
}
const WS_PROVIDER_IID = {} as Record<
    string, ReturnType<typeof setInterval>
>;
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

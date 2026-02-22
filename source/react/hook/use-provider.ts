import { Provider as get_provider, ProviderOptions, RemoteProviderOptions, WalletProviderOptions } from "@/blockchain";
import { PROVIDER_URL } from "@/constant";
import { Provider } from "ethers";
import { useEffect, useState } from "react";

export function useRemoteProvider(
    options?: Partial<RemoteProviderOptions>
) {
    return useProvider({
        ...options, url: options?.url ?? PROVIDER_URL
    });
}
export function useWalletProvider(
    options?: Partial<WalletProviderOptions>
) {
    return useProvider(options);
}
export function useProvider(
    options?: Partial<ProviderOptions>
) {
    const [provider, set_provider] = useState<
        null | Provider
    >(
        null
    );
    const { polling_ms, url } = options || {}
    useEffect(() => {
        const pro = get_provider(options);
        if (pro) set_provider(pro);
        return () => {
            set_provider(null);
        };
    }, [
        polling_ms, url,
    ]);
    return [provider, set_provider] as const;
}
export default useProvider;

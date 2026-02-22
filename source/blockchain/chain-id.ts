// deno-lint-ignore-file no-namespace
export enum ChainId {
    AVALANCHE_MAINNET = "0xa86a", // 43114
    AVALANCHE_FUJI = "0xa869", // 43113
    NETWORK_OTHER = "0x0", // fake-id
}
export namespace ChainId {
    export function from(id: string | null): ChainId | null {
        if (id) switch (id) {
            case ChainId.AVALANCHE_MAINNET:
                return ChainId.AVALANCHE_MAINNET;
            case ChainId.AVALANCHE_FUJI:
                return ChainId.AVALANCHE_FUJI;
            default:
                return ChainId.NETWORK_OTHER;
        }
        return null;
    }
    export function isAvalanche(id: ChainId): boolean {
        switch (id) {
            case ChainId.AVALANCHE_MAINNET:
            case ChainId.AVALANCHE_FUJI:
                return true;
            default:
                return false;
        }
    }
}
export default ChainId;

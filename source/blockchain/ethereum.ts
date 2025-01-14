import { EventEmitter } from "node:events";
/**
 * @see https://docs.metamask.io/wallet/reference/provider-api
 */
export interface Ethereum extends EventEmitter<EthereumEvents> {
    /**
     * Indicates whether the provider is connected to the current chain. If the provider isn't connected, the page must be reloaded to re-establish the connection. See the connect and disconnect events for more information.
     */
    isConnected: () => boolean;
    /**
     * This method is used to submit JSON-RPC API requests to Ethereum using MetaMask.
     *
     * @param args.method The JSON-RPC API method name.
     * @param args.params (Optional) Parameters of the RPC method. In practice, if a method has parameters, they're almost always of type array.
     * @returns A promise that resolves to the result of the RPC method call. If the request fails, the promise rejects with an error.
     */
    request: <R extends unknown, P extends unknown = unknown>(
        args: { method: string; params?: P[] },
    ) => Promise<R>;
    /**
     * This property is true if the user has MetaMask installed, and false otherwise.
     */
    isMetaMask?: boolean;
}
/**
 * @see https://docs.metamask.io/wallet/reference/provider-api/#events
 */
interface EthereumEvents {
    /**
     * The provider emits this event when the return value of the eth_accounts RPC method changes. eth_accounts returns either an empty array, or an array that contains the addresses of the accounts the caller is permitted to access with the most recently used account first. Callers are identified by their URL origin, which means that all sites with the same origin share the same permissions.
     * This means that the provider emits accountsChanged when the user's exposed account address changes. Listen to this event to handle accounts.
     */
    accountsChanged: [string[]];
    /**
     * The provider emits this event when the currently connected chain changes. Listen to this event to detect a user's network.
     */
    chainChanged: [string];
    /**
     * The provider emits this event when it's first able to submit RPC requests to a chain. We recommend listening to this event and using the isConnected() provider method to determine when the provider is connected.
     */
    connect: [{ chainId: string }];
    /**
     * The provider emits this event if it becomes unable to submit RPC requests to a chain. In general, this only happens due to network connectivity issues or some unforeseen error.
     * When the provider emits this event, it doesn't accept new requests until the connection to the chain is re-established, which requires reloading the page. You can also use the isConnected() provider method to determine if the provider is disconnected.
     */
    disconnect: [{ code: number; message: string; data?: unknown }];
    /**
     * The provider emits this event when it receives a message that the user should be notified of. The type property identifies the kind of message.
     * RPC subscription updates are a common use case for this event. For example, if you create a subscription using eth_subscribe, each subscription update is emitted as a message event with a type of eth_subscription.
     */
    message: [{ type: string; data: unknown }];
}
interface Global {
    ethereum: Ethereum | undefined;
}
declare const globalThis: Global;
export const ethereum = globalThis.ethereum;
export default ethereum;

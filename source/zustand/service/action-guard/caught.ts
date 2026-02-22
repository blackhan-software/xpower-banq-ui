import { TransferListener } from "@/contract";
import { RetryOptions, withRetry } from "@/function";
import { RETRY_REGISTRY } from "./retry-registry";

/**
 * Wraps a TransferListener with error catching and retry-on-failure.
 * Returns `[wrappedListener, cancelRetry]` for cleanup.
 */
export function caught(
    name: string,
    listener: (from: string, to: string, amount: bigint) => void | Promise<void>,
    onError?: (name: string, error: Error | null) => void,
    options?: RetryOptions,
): [TransferListener, () => void] {
    let lastArgs: [string, string, bigint] | undefined;
    let handle: ReturnType<typeof withRetry> | undefined;
    const wrapped: TransferListener = (from, to, amount) => {
        lastArgs = [from, to, amount];
        cancel_current();
        const result = listener(from, to, amount);
        if (result instanceof Promise) {
            result.catch((e) => {
                console.error(`[${name}]`, e);
                onError?.(name, e);
                handle = withRetry(
                    () => {
                        const r = listener(...lastArgs!);
                        return r instanceof Promise ? r : Promise.resolve();
                    },
                    (error) => {
                        console.error(`[${name}:retry]`, error);
                        onError?.(name, error);
                    },
                    () => {
                        onError?.(name, null);
                    },
                    options,
                );
                RETRY_REGISTRY.register(name, handle);
            });
        }
    };
    function cancel_current() {
        if (handle) {
            RETRY_REGISTRY.unregister(name, handle);
            handle.cancel();
            handle = undefined;
        }
    }
    function cancel_retry() {
        cancel_current();
    }
    return [wrapped, cancel_retry];
}
export default caught;

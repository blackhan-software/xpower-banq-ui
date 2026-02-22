export interface RetryHandle {
    // Cancels any pending retry attempts and resets the state
    cancel: () => void;
    // Immediately retries the operation, resetting the backoff state
    retry: () => void;
}
export interface RetryOptions {
    // Base delay in ms for the first retry attempt (default=1000)
    base?: number;
    // Max delay in ms between attempts (default=30000)
    ceiling?: number;
    // Max number of retry attempts (default=5)
    max?: number;
}
/**
 * Retries `fn` with exponential backoff on failure.
 *
 * @param fn async operation to retry
 * @param onError called on each failure
 * @param onSuccess called on recovery (after at least one failure)
 * @param options backoff tuning
 */
export function withRetry(
    fn: () => Promise<void>,
    onError: (error: Error) => void,
    onSuccess: () => void,
    options?: RetryOptions,
): RetryHandle {
    const base = options?.base ?? 1000;
    const ceiling = options?.ceiling ?? 30_000;
    const max = options?.max ?? 5;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failed = true;
    function schedule() {
        if (attempt >= max) return;
        const delay = Math.min(base * 2 ** attempt, ceiling);
        timer = setTimeout(() => {
            timer = undefined;
            attempt++;
            fn().then(() => {
                attempt = 0;
                if (failed) {
                    failed = false;
                    onSuccess();
                }
            }).catch((e) => {
                failed = true;
                onError(e);
                schedule();
            });
        }, delay);
    }
    function cancel() {
        if (timer !== undefined) {
            clearTimeout(timer);
            timer = undefined;
        }
        attempt = 0;
        failed = false;
    }
    function retry() {
        cancel();
        fn().then(() => {
            onSuccess();
        }).catch((e) => {
            failed = true;
            onError(e);
            schedule();
        });
    }
    schedule();
    return { cancel, retry };
}
export default withRetry;

export type Unsubscribe = () => void;
/**
 * Subscribes to multiple events based on an array of items.
 *
 * @param items Array of items to subscribe to.
 * @param setup Function to set up a single subscription; should return an unsubscribe function.
 * @returns A function that unsubscribes all the subscriptions.
 */
export async function onAll<T>(
    items: Array<T> | MapIterator<T>,
    setup: (item: T) => Promise<Unsubscribe>
): Promise<Unsubscribe> {
    const results = await Promise.allSettled(items.map(setup));
    for (const r of results) {
        if (r.status === 'rejected') {
            console.error('[on-all]', r.reason);
        }
    }
    const offs = results.flatMap(
        (r) => r.status === 'fulfilled' ? [r.value] : []
    );
    return () => {
        offs.forEach((off) => off());
    };
}
export default onAll

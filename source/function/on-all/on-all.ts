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
    const offs = await Promise.all(items.map(setup));
    return () => {
        offs.forEach((off) => off());
    };
}
export default onAll

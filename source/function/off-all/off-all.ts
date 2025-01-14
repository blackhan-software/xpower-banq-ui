import { Unsubscribe } from "../on-all/on-all";
/**
 * Unsubscribes from multiple subscriptions.
 *
 * @param offs Array of unsubscribe functions.
 */
export function offAll(offs: Unsubscribe[]): void {
    offs.forEach((off) => off());
}
export default offAll;

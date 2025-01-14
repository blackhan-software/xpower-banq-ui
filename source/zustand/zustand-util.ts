import { produce, castDraft } from "immer";

/**
 * Append element to array if it is *not* the last:
 */
export function add<T>(array: T[], element: T) {
    if (array[array.length - 1] !== element) {
        return produce(array, (draft) => {
            draft.push(castDraft(element));
        });
    }
    return array;
}

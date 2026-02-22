import { AppState } from "../../app-store";
import { ActionsSlice } from "../../slice";

type Action = ActionsSlice["actions"][number];

/**
 * Higher-order function that guards a sync subscriber
 * against action-triggered infinite loops.
 */
export function withActionGuard(
    action: Action,
    handler: (next: AppState, prev: AppState) => void | Promise<void>,
    onError?: (name: string, error: Error) => void,
): (next: AppState, prev: AppState) => void {
    return (next, prev) => {
        if (prev.actions.includes(action) &&
            !next.actions.includes(action)
        ) {
            return;
        }
        if (next.actions.includes(action)) {
            next.reset_actions(action);
            return;
        }
        const result = handler(next, prev);
        if (result instanceof Promise) {
            result.catch((e) => {
                console.error(`[${action}]`, e);
                onError?.(action, e);
            });
        }
    };
}
export default withActionGuard;

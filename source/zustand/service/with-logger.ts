import { Level } from "@/type";
import { ROParams } from "@/url";
import { Change, diffLines } from "diff";
import { Store } from "../zustand-type";

/**
 * @return A zustand store with a console logger service.
 */
export function withLogger<T>(
    store: Store<T>, level = ROParams.withLogger
) {
    store.subscribe((
        next_state: T,
        prev_state: T,
    ) => {
        const lines = [];
        const next = next_state as Record<string, unknown>;
        const prev = prev_state as Record<string, unknown>;
        const next_keys = new Set(Object.keys(next));
        const prev_keys = new Set(Object.keys(prev));
        for (const k of next_keys.union(prev_keys)) {
            //
            // skip functions: in next and prev
            //
            if (any_functions(k)) {
                continue;
            }
            const next_json
                = JSON.stringify(next[k], null, 2) ?? "";
            const prev_json
                = JSON.stringify(prev[k], null, 2) ?? "";
            //
            // non-equal values: of matching keys
            //
            if (level >= Level.INFO && neq_values(
                k, next_json, prev_json
            )) {
                lines.push([`%c[!] ${k}`, "color:yellow"]);
                if (level >= Level.MORE) {
                    diff(next_json, prev_json);
                }
                continue;
            }
            //
            // equal values: of matching keys
            //
            if (level >= Level.FULL && eql_values(
                k, next_json, prev_json
            )) {
                lines.push([`%c[=] ${k}`, "color:cyan"]);
                continue;
            }
            //
            // new key: in next but not in prev
            //
            if (level >= Level.FULL && new_key(
                k
            )) {
                lines.push([`%c[+] ${k}`, "color:lime"]);
                if (level >= Level.MORE) {
                    diff(next_json, prev_json);
                }
                continue;
            }
            //
            // old key: in prev but not in next
            //
            if (level >= Level.FULL && old_key(
                k
            )) {
                lines.push([`%c[-] ${k}`, "color:red"]);
                if (level >= Level.MORE) {
                    diff(next_json, prev_json);
                }
                continue;
            }
        }
        //
        // Log changes to debug console:
        //
        if (lines.length) {
            console.debug(
                `%c[>] ${new Date().toISOString()}`,
                'color:whitesmoke;font-weight:bold'
            );
            lines.forEach(
                (line) => console.debug(...line)
            );
        }
        function any_functions(k: string) {
            if (typeof next[k] === "function" ||
                typeof prev[k] === "function"
            ) {
                return true;
            }
            return false;
        }
        function neq_values(
            k: string, next_json: string, prev_json: string
        ) {
            if (next_keys.has(k) && prev_keys.has(k)) {
                return next_json !== prev_json;
            }
            return false;
        }
        function eql_values(
            k: string, next_json: string, prev_json: string
        ) {
            if (next_keys.has(k) && prev_keys.has(k)) {
                return next_json === prev_json;
            }
            return false;
        }
        function new_key(k: string) {
            return next_keys.has(k) && !prev_keys.has(k);
        }
        function old_key(k: string) {
            return !next_keys.has(k) && prev_keys.has(k);
        }
        function diff(
            next_json: string,
            prev_json: string,
        ) {
            diffLines(prev_json, next_json).forEach(
                (delta) => lines.push([
                    `%c${delta.value.trimEnd()}`,
                    `color:${color(delta)}`,
                ])
            );
        }
    });
    return store;
}
function color(
    change: Change
) {
    if (change.added) {
        return "lime";
    }
    if (change.removed) {
        return "red";
    }
    return "grey";
}
export default withLogger;

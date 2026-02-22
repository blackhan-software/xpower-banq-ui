import { useMemo } from "react";

export function useJSON<T>(value: undefined): readonly [null, 0];
export function useJSON<T>(value: T): readonly [string, number];
export function useJSON<T>(value: T) {
    if (value === undefined) {
        return [null, 0] as readonly [null, number];
    }
    const json = useMemo<string>(
        () => JSON.stringify(value), [value]
    );
    return [json, json.length] as readonly [string, number];
}
export default useJSON;

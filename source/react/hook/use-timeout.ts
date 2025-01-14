import { useEffect, useRef, useCallback } from 'react';

type Callback = () => void;
type Clear = () => void;

export function useTimeout(
    callback: Callback, delay: number | null
): Clear {
    const my_callback = useRef<Callback | null>(null);
    // Remember the latest callback
    useEffect(() => {
        my_callback.current = callback;
    }, [callback]);
    // Set up the timeout
    useEffect(() => {
        if (delay === null) {
            return;
        }
        const tick = () => {
            if (my_callback.current) {
                my_callback.current();
            }
        };
        const id = setTimeout(tick, delay);
        return () => clearTimeout(id); // cleanup
    }, [delay]);
    // Allow manual clearing of the timeout
    const clear = useCallback(() => {
        clearTimeout(my_callback.current as unknown as number);
    }, []);
    return clear;
}

export default useTimeout;

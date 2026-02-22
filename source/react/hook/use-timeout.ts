import { useEffect, useRef, useCallback } from 'react';

type Callback = () => void;
type Clear = () => void;

export function useTimeout(
    callback: Callback, delay: number | null
): Clear {
    const my_callback = useRef<Callback | null>(null);
    const my_timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
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
        my_timeout.current = setTimeout(tick, delay);
        return () => {
            if (my_timeout.current !== null) {
                clearTimeout(my_timeout.current);
                my_timeout.current = null;
            }
        };
    }, [delay]);
    // Allow manual clearing of the timeout
    const clear = useCallback(() => {
        if (my_timeout.current !== null) {
            clearTimeout(my_timeout.current);
            my_timeout.current = null;
        }
    }, []);
    return clear;
}

export default useTimeout;

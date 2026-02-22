import { RetryHandle } from "@/function";

const handles = new Map<string, Set<RetryHandle>>();

export const RETRY_REGISTRY = {
    register(name: string, handle: RetryHandle): void {
        let set = handles.get(name);
        if (!set) {
            set = new Set();
            handles.set(name, set);
        }
        set.add(handle);
    },
    unregister(name: string, handle: RetryHandle): void {
        const set = handles.get(name);
        if (set) {
            set.delete(handle);
            if (set.size === 0) {
                handles.delete(name);
            }
        }
    },
    retryAll(): void {
        for (const set of handles.values()) {
            for (const handle of set) {
                handle.retry();
            }
        }
    },
};
export default RETRY_REGISTRY;

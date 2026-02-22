import { appStore } from "@/zustand";

export function usePool() {
    const { pool, set_pool } = appStore();
    return [pool, set_pool] as const;
}
export default usePool;

import { appStore } from "@/zustand";

export function useErrors() {
    const { errors, set_error } = appStore();
    return [errors, set_error] as const;
}
export default useErrors;

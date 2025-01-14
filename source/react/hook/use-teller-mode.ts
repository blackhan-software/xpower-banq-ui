import { appStore } from "@/zustand";

export function useTellerMode() {
    const { teller_mode, set_teller_mode } = appStore();
    return [teller_mode, set_teller_mode] as const;
}
export default useTellerMode;

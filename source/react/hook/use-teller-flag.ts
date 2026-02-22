import { appStore } from "@/zustand";

export function useTellerFlag() {
    const { teller_flag, set_teller_flag } = appStore();
    return [teller_flag, set_teller_flag] as const;
}
export default useTellerFlag;

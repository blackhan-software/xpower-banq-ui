import { ROParams } from "@/url";
import { Store } from "../zustand-type";
import { withLogger } from "./with-logger";
import { withSync } from "./with-sync";
import { AppState } from "../app-store";

/**
 * @return A zustand store including services.
 */
export function withServices(
    store: Store<AppState>,
) {
    if (ROParams.withLogger) {
        store = withLogger(store);
    }
    if (ROParams.withSync) {
        store = withSync(store);
    }
    return store;
}
export default withServices;

import { WebSocketProvider } from "ethers";

const WS_FAILURES_MAX = 3;

export class WSProvider {
    readonly provider: WebSocketProvider;

    private iid: ReturnType<typeof setInterval> | undefined;
    private disposed = false;
    private failures = 0;

    constructor(url: string, polling_ms: number) {
        this.provider = new WebSocketProvider(url);
        this.provider.once("block", () => {
            if (this.disposed) return;
            this.startKeepAlive(polling_ms);
        });
    }

    private startKeepAlive(polling_ms: number) {
        this.iid = setInterval(async () => {
            if (this.disposed) return;
            const tid = setTimeout(() => {
                this.failures++;
                if (this.failures >= WS_FAILURES_MAX) {
                    this.reconnect();
                }
            }, polling_ms);
            try {
                const n = await this.provider.getBlockNumber();
                console.assert(!!n, "missing block");
                clearTimeout(tid);
                this.failures = 0;
            } catch {
                clearTimeout(tid);
                this.failures++;
                if (this.failures >= WS_FAILURES_MAX) {
                    this.reconnect();
                }
            }
        }, polling_ms);
    }

    private reconnect() {
        this.dispose();
        location.reload();
    }

    dispose() {
        this.disposed = true;
        if (this.iid !== undefined) {
            clearInterval(this.iid);
            this.iid = undefined;
        }
        this.provider.destroy();
    }
}
export default WSProvider;

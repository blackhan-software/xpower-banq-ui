// deno-lint-ignore-file no-namespace
export enum Status {
    NoProvider = 0,
    WrongNetwork,
    NoAccounts,
    Ready,
}
export namespace Status {
    export function label(
        status: Status | null
    ): string {
        switch (status) {
            case Status.WrongNetwork:
                return "Switch Network";
            case Status.NoAccounts:
                return "Connect Wallet";
            case Status.Ready:
                return "Accounts Ready";
            default:
                return "Install Wallet";
        }
    }
}
export default Status;

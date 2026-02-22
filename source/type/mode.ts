// deno-lint-ignore-file no-namespace
export enum Mode {
    supply = "supply",
    borrow = "borrow"
}
export namespace Mode {
    export function from(text: string): Mode {
        switch (text) {
            case "supply":
                return Mode.supply;
            case "borrow":
                return Mode.borrow;
        }
        throw new Error(`invalid mode: ${text}`);
    }
    /** @returns The past tense of the mode. */
    export function modal(mode: Mode): string {
        switch (mode) {
            case Mode.supply:
                return "supplied";
            case Mode.borrow:
                return "borrowed";
        }
    }
}
export default Mode;

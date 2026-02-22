const { DEV, PROD } = import.meta.env;
import { Parser } from "@/function";
import { Level } from "@/type/logger";

export class ROParams {
    /**
     * @returns Location URL's parsed query value for key(s).
     */
    static get<
        T extends boolean | bigint | number | object | string
    >(
        key: string | string[],
        fallback: T | ((text: string | null) => T)
    ): T {
        const keys = Array.isArray(key) ? key : [key];
        const text = keys // first non-null
            .map((k) => this._search.get(k))
            .find((t) => t !== null) ?? null;
        if (callable(fallback)) {
            return parse(fallback(text));
        } else {
            return parse(fallback);
        }
        function callable(
            fb: T | ((t: string | null) => T)
        ): fb is ((t: string | null) => T) {
            return typeof fb === "function";
        }
        function parse(fb: T) {
            switch (typeof fb) {
                case "boolean":
                    return Parser.boolean(text, fb) as T;
                case "bigint":
                    return Parser.bigint(text, fb) as T;
                case "number":
                    return Parser.number(text, fb) as T;
                case "object":
                    return Parser.object(text, fb) as T;
                case "string":
                    return Parser.string(text, fb) as T;
            }
        }
    }
    /**
     * @returns Location URL's query key(s) existence.
     */
    static has(key: string | string[]): boolean {
        const keys = Array.isArray(key) ? key : [key];
        const text = keys // first non-null
            .map((k) => this._search.get(k))
            .find((t) => t !== null) ?? null;
        return text !== null;
    }
    /**
     * @returns React Query stale time in milliseconds.
     */
    static get rqStaleTime(): number {
        return this.get("rq-stale-time", 2_000);
    }
    /**
     * @returns Zustand devtools middleware flag.
     */
    static get withDevtools(): boolean {
        return this.get("with-devtools", (t) => t === "" || DEV);
    }
    /**
     * @returns Zustand logging service flag.
     */
    static get withLogger(): Level {
        const text = this._search.get("with-logger");
        const flag = Parser.boolean(text, text === "" || DEV);
        return Parser.number(text, flag ? Level.MORE : Level.NONE);
    }
    /**
     * @returns Zustand session middleware flag.
     */
    static get withSession(): boolean {
        return this.get("with-session", (t) => t === "" || PROD);
    }
    /**
     * @returns Zustand sync service flag.
     */
    static get withSync(): boolean {
        return this.get("with-sync", true);
    }
    static _search = new URLSearchParams(
        location.search
    );
}
export default ROParams;

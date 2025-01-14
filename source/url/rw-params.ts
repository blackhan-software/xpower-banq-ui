import { P000_ADDRESS, NULL_ADDRESS } from "@/constant";
import { addressOf as x } from "@/function";
import { Account, Mode, Pool, Token } from "@/type";
import { ROParams } from "./ro-params";

export class RWParams {
    static get account(): Account {
        return ROParams.get("account", 0n);
    }
    static set account(value: Account | null) {
        const search = this._search();
        if (value !== null) {
            search.set("account", x(value));
        } else {
            search.delete("account");
        }
        this._push({ search });
    }
    static get portfolio(): boolean {
        return ROParams.get("portfolio", true);
    }
    static set portfolio(value: boolean | null) {
        const search = this._search();
        if (value === false) {
            search.set("portfolio", "0");
        } else {
            search.delete("portfolio");
        }
        this._push({ search });
    }
    static get pool(): Pool {
        return ROParams.get("pool", P000_ADDRESS);
    }
    static set pool(value: Pool | null) {
        const search = this._search();
        if (value !== null) {
            search.set("pool", x(value));
        } else {
            search.delete("pool");
        }
        this._push({ search });
    }
    static get mode(): Mode {
        return Mode.from(ROParams.get("mode", Mode.supply));
    }
    static set mode(value: Mode | null) {
        const search = this._search();
        if (value !== null) {
            search.set("mode", value);
        } else {
            search.delete("mode");
        }
        this._push({ search });
    }
    static get token(): Token {
        const token_base = this._token;
        const token = Token.from(
            ROParams.get("token", token_base.symbol)
        );
        const tokens = Pool.tokens(RWParams.pool);
        if (tokens?.includes(x(token.address))) {
            return token;
        }
        this.token = token_base;
        return token_base;
    }
    static set token(value: Token | null) {
        const search = this._search();
        if (value !== null) {
            search.set("token", value.symbol);
        } else {
            search.delete("token");
        }
        this._push({ search });
    }
    private static get _token(): Token {
        const address = Pool.token(this.pool);
        return Token.from(address ?? x(NULL_ADDRESS));
    }
    static _hash() {
        return location.hash;
    }
    static _pathname() {
        return location.pathname;
    }
    static _push({
        pathname,
        search,
        hash,
    }: Partial<{
        hash: string
        pathname: string,
        search: URLSearchParams,
    }>) {
        if (pathname === undefined) {
            pathname = location.pathname;
        }
        if (search === undefined) {
            search = this._search();
        }
        if (hash === undefined) {
            hash = this._hash();
        }
        const prefix = `${search}`.length ? "?" : "";
        history.pushState(
            { page: 1 }, document.title,
            `${pathname}${prefix}${search}${hash}`
        );
    }
    static _search() {
        const search = location.search;
        return new URLSearchParams(search);
    }
}
export default RWParams;

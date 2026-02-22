export function polyfill(
    parse: typeof JSON.parse,
) {
    polyfill_bigint(parse);
    polyfill_map();
    polyfill_set();
}
/**
 * Polyfill for BigInt JSON (de)serialization.
 */
export function polyfill_bigint(
    parse: typeof JSON.parse,
) {
    if (!BigIntProto.toJSON) {
        BigIntProto.toJSON = function () {
            return `${this.toString()}n`;
        };
        const bi = new RegExp(/^[+-]?[0-9]+n$/);
        JSON.parse = function (value: string) {
            return parse(value, (_, v) => {
                if (typeof v === 'string' && v.match(bi)) {
                    return BigInt(v.slice(0, -1));
                }
                return v;
            });
        };
    }
}
const BigIntProto = BigInt.prototype as {
    toJSON?: (this: BigIntConstructor) => string;
};
/**
 * Polyfill for JSON serialization of Map.
 * @info Hack for zustand's devtools!
 */
export function polyfill_map() {
    if (!MapProto.toJSON) {
        MapProto.toJSON = function () {
            return JSON.parse(JSON.stringify([...this]));
        };
    }
};
const MapProto = Map.prototype as {
    toJSON?: <T>(this: IterableIterator<T>) => unknown;
};
/**
 * Polyfill for JSON serialization of Set.
 * @info Hack for zustand's devtools!
 */
export function polyfill_set() {
    if (!SetProto.toJSON) {
        SetProto.toJSON = function () {
            return JSON.parse(JSON.stringify([...this]));
        };
    }
};
const SetProto = Set.prototype as {
    toJSON?: <T>(this: IterableIterator<T>) => unknown;
};
export default polyfill;

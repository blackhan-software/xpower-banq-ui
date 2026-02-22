/**
 * @returns `true` on desktop and else `false`; but, if a value is
 * provided then returns the value on desktop and else `undefined`
 */
export function nomobi<_>(value?: undefined, fallback?: undefined): boolean;
export function nomobi<T>(value?: T, fallback?: T): T;
export function nomobi<T>(value?: T, fallback?: T) {
    const ua_mobile = Boolean(
        navigator?.userAgent?.match(/mobi/i)
    );
    if (value !== undefined) {
        return !ua_mobile ? value : fallback;
    }
    return !ua_mobile;
}
export default nomobi;

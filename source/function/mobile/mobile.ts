/**
 * @returns `true` on mobile and else `false`; but, if a value is
 * provided then returns the value on mobile and else `undefined`
 */
export function mobile<_>(value?: undefined, fallback?: undefined): boolean;
export function mobile<T>(value?: T, fallback?: T): T;
export function mobile<T>(value?: T, fallback?: T) {
    const ua_mobile = Boolean(
        navigator?.userAgent?.match(/mobi/i)
    );
    if (value !== undefined) {
        return ua_mobile ? value : fallback;
    }
    return ua_mobile;
}
export default mobile;

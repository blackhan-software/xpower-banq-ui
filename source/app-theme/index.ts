import Color from "color";

export function yellow(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-yellow" + suffix(i));
    return with_opacity(xp, a);
}
export function yellowDark(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-yellow-dark" + suffix(i));
    return with_opacity(xp, a);
}
export function lime(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-lime" + suffix(i));
    return with_opacity(xp, a);
}
export function limeDark(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-lime-dark" + suffix(i));
    return with_opacity(xp, a);
}
export function cyan(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-cyan" + suffix(i));
    return with_opacity(xp, a);
}
export function cyanDark(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-cyan-dark" + suffix(i));
    return with_opacity(xp, a);
}
export function blue(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-blue" + suffix(i));
    return with_opacity(xp, a);
}
export function blueDark(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-blue-dark" + suffix(i));
    return with_opacity(xp, a);
}
export function magenta(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-magenta" + suffix(i));
    return with_opacity(xp, a);
}
export function magentaDark(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-magenta-dark" + suffix(i));
    return with_opacity(xp, a);
}
export function red(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-red" + suffix(i));
    return with_opacity(xp, a);
}
export function redDark(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-red-dark" + suffix(i));
    return with_opacity(xp, a);
}
export function gray(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-gray" + suffix(i));
    return with_opacity(xp, a);
}
export function grayDark(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-gray-dark" + suffix(i));
    return with_opacity(xp, a);
}
export function white(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-white" + suffix(i));
    return with_opacity(xp, a);
}
export function whiteDark(a = 1.00, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-white-dark" + suffix(i));
    return with_opacity(xp, a);
}
export function magenta25(a = 0.25, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-magenta-25" + suffix(i));
    return with_opacity(xp, a);
}
export function magenta50(a = 0.50, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-magenta-50" + suffix(i));
    return with_opacity(xp, a);
}
export function magenta75(a = 0.75, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-magenta-75" + suffix(i));
    return with_opacity(xp, a);
}
export function magentaDark25(a = 0.25, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-magenta-dark-25" + suffix(i));
    return with_opacity(xp, a);
}
export function magentaDark50(a = 0.50, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-magenta-dark-50" + suffix(i));
    return with_opacity(xp, a);
}
export function magentaDark75(a = 0.75, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-magenta-dark-75" + suffix(i));
    return with_opacity(xp, a);
}
export function gray25(a = 0.25, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-gray-25" + suffix(i));
    return with_opacity(xp, a);
}
export function gray50(a = 0.50, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-gray-50" + suffix(i));
    return with_opacity(xp, a);
}
export function gray75(a = 0.75, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-gray-75" + suffix(i));
    return with_opacity(xp, a);
}
export function grayDark25(a = 0.25, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-gray-dark-25" + suffix(i));
    return with_opacity(xp, a);
}
export function grayDark50(a = 0.50, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-gray-dark-50" + suffix(i));
    return with_opacity(xp, a);
}
export function grayDark75(a = 0.75, i = false) {
    const el = getComputedStyle(document.documentElement);
    const xp = el.getPropertyValue("--xp-gray-dark-75" + suffix(i));
    return with_opacity(xp, a);
}
export function appTheme() {
    const el = getComputedStyle(document.documentElement);
    return {
        YELLOW: el.getPropertyValue("--xp-yellow"),
        YELLOW_DARK: el.getPropertyValue("--xp-yellow-dark"),
        YELLOW_I: el.getPropertyValue("--xp-yellow-i"),
        YELLOW_DARK_I: el.getPropertyValue("--xp-yellow-dark-i"),
        LIME: el.getPropertyValue("--xp-lime"),
        LIME_DARK: el.getPropertyValue("--xp-lime-dark"),
        LIME_I: el.getPropertyValue("--xp-lime-i"),
        LIME_DARK_I: el.getPropertyValue("--xp-lime-dark-i"),
        CYAN: el.getPropertyValue("--xp-cyan"),
        CYAN_DARK: el.getPropertyValue("--xp-cyan-dark"),
        CYAN_I: el.getPropertyValue("--xp-cyan-i"),
        CYAN_DARK_I: el.getPropertyValue("--xp-cyan-dark-i"),
        BLUE: el.getPropertyValue("--xp-blue"),
        BLUE_DARK: el.getPropertyValue("--xp-blue-dark"),
        BLUE_I: el.getPropertyValue("--xp-blue-i"),
        BLUE_DARK_I: el.getPropertyValue("--xp-blue-dark-i"),
        MAGENTA: el.getPropertyValue("--xp-magenta"),
        MAGENTA_DARK: el.getPropertyValue("--xp-magenta-dark"),
        MAGENTA_I: el.getPropertyValue("--xp-magenta-i"),
        MAGENTA_DARK_I: el.getPropertyValue("--xp-magenta-dark-i"),
        RED: el.getPropertyValue("--xp-red"),
        RED_DARK: el.getPropertyValue("--xp-red-dark"),
        RED_I: el.getPropertyValue("--xp-red-i"),
        RED_DARK_I: el.getPropertyValue("--xp-red-dark-i"),
        GRAY: el.getPropertyValue("--xp-gray"),
        GRAY_DARK: el.getPropertyValue("--xp-gray-dark"),
        GRAY_I: el.getPropertyValue("--xp-gray-i"),
        GRAY_DARK_I: el.getPropertyValue("--xp-gray-dark-i"),
        WHITE: el.getPropertyValue("--xp-white"),
        WHITE_DARK: el.getPropertyValue("--xp-white-dark"),
        WHITE_I: el.getPropertyValue("--xp-white-i"),
        WHITE_DARK_I: el.getPropertyValue("--xp-white-dark-i"),
    };
}
function with_opacity(color: string, opacity: number): string {
    return Color(color).alpha(opacity).string();
}
function suffix(i: boolean) {
    return i ? "-i" : "";
}
export default appTheme;

export function dot(
    text: string, suffix = ".", regex = /[^,.:;!?]$/i,
): string {
    if (text.length > 0 &&
        text[text.length - 1] !== suffix &&
        text[text.length - 1]?.match(regex)
    ) {
        return text + suffix;
    }
    return text;
}
export default dot;

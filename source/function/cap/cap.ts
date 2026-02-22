export function cap(text: string): string {
    if (text[0]) {
        return text[0].toUpperCase() + text.slice(1);
    }
    return "";
}
export default cap;

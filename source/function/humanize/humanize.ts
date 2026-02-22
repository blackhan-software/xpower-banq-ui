/**
 * Humanize a duration in seconds, matching moment.duration().humanize() behavior.
 *
 * @param seconds - Duration in seconds (positive or negative)
 * @param relative - If true, prefix with "in" or suffix with "ago"
 * @returns Human-readable duration string
 */
export function humanize(seconds: number, relative?: boolean): string {
    const abs = Math.abs(seconds);
    let text: string;
    if (abs < 45) {
        text = "a few seconds";
    } else if (abs < 90) {
        text = "a minute";
    } else if (abs < 45 * 60) {
        text = `${Math.round(abs / 60)} minutes`;
    } else if (abs < 90 * 60) {
        text = "an hour";
    } else if (abs < 22 * 3600) {
        text = `${Math.round(abs / 3600)} hours`;
    } else if (abs < 36 * 3600) {
        text = "a day";
    } else if (abs < 26 * 86400) {
        text = `${Math.round(abs / 86400)} days`;
    } else if (abs < 45 * 86400) {
        text = "a month";
    } else if (abs < 345 * 86400) {
        text = `${Math.round(abs / (30 * 86400))} months`;
    } else if (abs < 545 * 86400) {
        text = "a year";
    } else {
        text = `${Math.round(abs / (365 * 86400))} years`;
    }
    if (relative) {
        return seconds >= 0 ? `in ${text}` : `${text} ago`;
    }
    return text;
}

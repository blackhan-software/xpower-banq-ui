export type Version = {
    major: number;
    minor: number;
}
export const Version = {
    /** @returns a version from a string like "v10a" or "10a" */
    from(run: string): Version {
        const match = run.match(/v?(\d+)([a-z]?)/);
        if (!match) return { major: 0, minor: 0 };
        const major = Number(match[1]);
        const minor = match[2] ? match[2].charCodeAt(0) - 96 : 0;
        return { major, minor };
    },
    /** @returns a comparable number for a version string */
    v(run: string): number {
        const { major, minor } = Version.from(run);
        return major * 100 + minor;
    },
}
export default Version;

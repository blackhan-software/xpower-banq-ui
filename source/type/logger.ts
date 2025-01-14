/**
 * Logger level: NONE, INFO, MORE, FULL
 */
export enum Level {
    /** log nothing */
    NONE = 0,
    /** log only changes */
    INFO = 1,
    /** log only changes with diffs */
    MORE = 2,
    /** log everything */
    FULL = 3,
}
export default Level;

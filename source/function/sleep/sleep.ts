/**
 * Sleep function that delays execution for a specified amount of time.
 *
 * @param ms - The number of milliseconds to delay.
 * @returns A promise that resolves after the specified time.
 */
export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
export default sleep;

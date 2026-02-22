export type LockParams = {
    bonus: number; // r_bonus scaled by UNIT
    malus: number; // r_malus scaled by UNIT
};
export const LockParams = {
    from: (bonus: bigint, malus: bigint): LockParams => ({
        bonus: Number(bonus), malus: Number(malus),
    }),
    init: (): LockParams => ({ bonus: 0, malus: 0 }),
};
export default LockParams;

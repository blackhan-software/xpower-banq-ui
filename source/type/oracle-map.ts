import { P000_ADDRESS, P001_ADDRESS, P002_ADDRESS, P003_ADDRESS, P004_ADDRESS, P005_ADDRESS, P006_ADDRESS } from "@/constant";
import { T000_ADDRESS, T001_ADDRESS, T002_ADDRESS, T003_ADDRESS, T004_ADDRESS, T005_ADDRESS, T006_ADDRESS } from "@/constant";
import { addressOf as x } from "@/function";

export type OracleMap = {
    [pool_address: string]: bigint;
};
export const ORACLE_MAP: OracleMap = {
    [x(P000_ADDRESS)]: T000_ADDRESS,
    [x(P001_ADDRESS)]: T001_ADDRESS,
    [x(P002_ADDRESS)]: T002_ADDRESS,
    [x(P003_ADDRESS)]: T003_ADDRESS,
    [x(P004_ADDRESS)]: T004_ADDRESS,
    [x(P005_ADDRESS)]: T005_ADDRESS,
    [x(P006_ADDRESS)]: T006_ADDRESS,
};
export default ORACLE_MAP;

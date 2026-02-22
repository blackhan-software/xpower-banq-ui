import { isAddress } from "ethers";

export type Address = string;
export const Address = {
    /**
     * Checks if a value is an address.
     *
     * @param value of unknown type
     * @returns True if value is an address
     */
    isAddress: (value: unknown): value is Address => {
        return isAddress(value);
    },
};
export default Address;

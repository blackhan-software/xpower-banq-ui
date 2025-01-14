import { Addressable, isAddress, NameResolver, resolveAddress } from "ethers";

export type Address = string | Promise<string>;
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
    /**
     * Converts an addressable object to an address.
     *
     * @param addressable object
     * @returns A promise resolving to an address
     */
    from: (addressable: Addressable): Address => {
        return addressable.getAddress();
    },
    /**
     * Resolves an address to a resolved address.
     *
     * @param address to resolve
     * @param resolver optional
     * @returns an address
     */
    resolve: async (
        address: Address,
        resolver?: null | NameResolver
    ): Promise<Address> => {
        return resolveAddress(await address, resolver);
    },
};
export default Address;

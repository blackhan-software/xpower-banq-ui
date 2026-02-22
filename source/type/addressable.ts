import { Addressable as IAddressable, AddressLike, isAddressable, NameResolver, resolveAddress } from "ethers";

export type Addressable = IAddressable;
export const Addressable = {
    /**
     * Checks if a value is an addressable object.
     *
     * @param value of unknown type
     * @returns True if value is addressable
     */
    isAddressable: (value: unknown): value is Addressable => {
        return isAddressable(value);
    },
    /**
     * Converts an address-like object to an addressable.
     *
     * @param address like object
     * @returns an addressable object
     */
    from: (address: AddressLike): Addressable => {
        if (typeof address === "string") {
            return { getAddress: () => Promise.resolve(address) };
        }
        if (address instanceof Promise) {
            return { getAddress: () => address };
        }
        return address;
    },
    /**
     * Resolves an addressable to a resolved addressable.
     *
     * @param addressable to resolve
     * @param resolver optional
     * @returns an addressable
     */
    resolve: (
        addressable: Addressable,
        resolver?: null | NameResolver
    ): Addressable => {
        return {
            getAddress: async () => {
                const a = addressable.getAddress();
                return await resolveAddress(a, resolver);
            },
        };
    }
};
export default Addressable;

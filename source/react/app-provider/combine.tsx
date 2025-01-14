import { ComponentType, ReactNode } from 'react';
/**
 * Provider component wrapping its children in a context provider.
 */
type ProviderComponent = ComponentType<{
    children: ReactNode
}>;
/**
 * @returns multiple providers combined into one
 */
export function combine(
    ...providers: ProviderComponent[]
) {
    return ({ children }: { children: ReactNode }) => {
        return providers.reduceRight(
            (acc, Pro) => { return <Pro>{acc}</Pro>; }, children
        );
    }
};
export default combine;

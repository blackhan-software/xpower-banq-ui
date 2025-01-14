import React from "react";

export type Classic<
    A extends React.HTMLAttributes<E>,
    E extends HTMLElement = HTMLElement,
> = Omit<A, "className"> & {
    class?: string | string[],
}
export function withClassic<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLElement,
>(
    props: React.DetailedHTMLProps<A, E>,
) {
    if (typeof props.class === "string") {
        props = {
            ...props, className: props.class
        };
        delete props.class;
        return props;
    }
    if (Array.isArray(props.class)) {
        props = {
            ...props, className: props.class.join(" ")
        };
        delete props.class;
        return props;
    }
    return props;
}
export default withClassic;

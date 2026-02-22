import { GLOBAL } from "@/constant";
import { A, Classic } from "@/react/element";
import React, { useEffect, useState } from "react";

export const Link = React.forwardRef(<
    A extends Classic<React.AnchorHTMLAttributes<E>>,
    E extends HTMLAnchorElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <A
        ref={ref} class={[
            ...props.class ?? [],
            "focus-ring",
            "text-muted",
        ]}
        rel="noreferrer"
        target="_blank"
        {...props}
    >
        {props.children}
    </A>;
});
export const MultiLink = React.forwardRef(<
    A extends Classic<React.AnchorHTMLAttributes<E>>,
    E extends HTMLAnchorElement,
>(
    props: React.DetailedHTMLProps<A, E> & {
        hrefs?: string[];
    },
    ref: React.ForwardedRef<E>
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    const [index, set_index] = useState(0);
    useEffect(() => {
        const on_keyup = () => set_index(0);
        const on_keydown = (e: KeyboardEvent) => {
            set_index(e.ctrlKey ? 1 : 0);
        };
        GLOBAL.addEventListener("keyup", on_keyup);
        GLOBAL.addEventListener("keydown", on_keydown);
        return () => {
            GLOBAL.removeEventListener("keyup", on_keyup);
            GLOBAL.removeEventListener("keydown", on_keydown);
        };
    }, []);
    return <Link
        ref={ref} href={props.hrefs?.[index]} {...props}
    >
        {props.children}
    </Link>;
});
export default Link;

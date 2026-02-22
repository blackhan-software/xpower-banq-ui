import { Tooltip } from "bootstrap";
import React, { useEffect } from "react";

export function withTooltip<
    A extends React.HTMLAttributes<E>,
    E extends HTMLElement
>(
    props: React.DetailedHTMLProps<A, E> & {
        "bs-placement"?: string,
        "bs-toggle"?: string,
        "bs-html"?: string,
    },
    ref: React.ForwardedRef<E>,
) {
    useEffect(() => {
        if (ref && typeof ref !== "function" && props.title) {
            const tip = tooltip(ref.current);
            return () => tip?.dispose();
        }
        return () => { };
    }, [
        props.title,
    ]);
    if (props.title) return {
        "data-bs-placement": props["bs-placement"] ?? "top",
        "data-bs-toggle": props["bs-toggle"] ?? "tooltip",
        "data-bs-html": props["bs-html"] ?? undefined,
        "data-bs-original-title": props.title,
        "aria-label": props.title,
        ...props
    };
    return props;
}
const tooltip = ($el: HTMLElement | null) => {
    if ($el) {
        return Tooltip.getOrCreateInstance($el);
    }
    return null;
};
export default withTooltip;

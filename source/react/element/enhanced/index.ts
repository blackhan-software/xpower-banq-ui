export { type Classic } from "./with-classic";

import React from "react";
import { withClassic } from "./with-classic";
import { withTooltip } from "./with-tooltip";

export function enhanced<
    A extends React.HTMLAttributes<E>,
    E extends HTMLElement
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) {
    return { ...withTooltip(withClassic(props), ref) };
}
export default enhanced;

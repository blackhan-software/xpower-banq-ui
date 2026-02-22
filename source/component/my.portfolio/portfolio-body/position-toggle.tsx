import { render } from "@/function";
import { SVG } from "@/image";
import { Mode, Position, RateInfo } from "@/type";

import { Button, Span } from "@/react/element";
import { useState } from "react";

import { IconButton } from "../../lib.button";
import { IconSector } from "./icon-sector";
import { PositionLabelTitle } from "./position-label";

export function PositionToggle({ position, rate, mode, index }: {
    position: Position;
    rate: RateInfo;
    mode: Mode;
    index: number;
}) {
    const label_title = PositionLabelTitle(position, mode);
    const [title, toggle_title] = usePositionToggleTitle();
    const { symbol } = position;
    return <>
        <IconButton
            class={[
                "focus-ring", "focus-ring-secondary",
                "btn", "btn-outline-secondary",
                "btn-toggle",
            ]}
            data-bs-target={`#accordion-body-${index}`}
            data-bs-toggle="collapse"
            onClick={toggle_title}
            icon="bi-caret-right"
            icon-suffix="-fill"
            aria-label={title}
            title={title}
            type="button"
        />
        <Button
            class={[
                "focus-ring", "focus-ring-secondary",
                "btn", "btn-outline-secondary",
                "d-inline d-sm-none",
                "btn-toggle",
            ]}
            type="button"
        >
            <Span
                title={render(label_title)} bs-html="true"
            >
                <Span style={{ position: "relative" }}>
                    <SVG icon={symbol} height={16} width={16} />
                    <IconSector position={position} rate={rate} />
                </Span>
            </Span>
        </Button>
    </>;
}
function usePositionToggleTitle() {
    const [show, set_show] = useState(false);
    if (show) {
        return ["Hide Rates", () => set_show(false)] as const;
    } else {
        return ["Show Rates", () => set_show(true)] as const;
    }
}
export default PositionToggle;

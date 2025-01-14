import "./teller-range.scss";

import { Div, Input, Span } from "@/react/element";
import { useTellerMode, useTellerPercent } from "@/react/hook";
import { useEffect, useRef } from "react";

export function TellerRange() {
    const [mode] = useTellerMode();
    const [percent, set_percent] = useTellerPercent(mode);
    const $ref = useRef<HTMLInputElement>(
        document.getElementById("teller-range") as HTMLInputElement
    );
    useEffect(() => {
        $ref.current?.style.setProperty(
            "--xp-percent", `${Math.round(percent ?? 0)}%`
        );
    }, [
        $ref.current,
        percent,
    ]);
    return <Div
        class="slider-container"
    >
        <Div class="ticks">
            <Span class="tick" />
            <Span class="tick" />
            <Span class="tick" />
        </Div>
        <Input ref={$ref}
            class="form-range"
            id="teller-range"
            onChange={(e) => {
                const raw_value = e.target.value;
                const num_value = Number(raw_value);
                if (num_value !== percent) {
                    set_percent(num_value);
                }
            }}
            min={0} max={100} step={1}
            value={percent ?? 0}
            type="range"
        />
    </Div>;
}
export default TellerRange;

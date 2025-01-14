import { Button, Div, I } from "@/react/element";
import { useTellerMode } from "@/react/hook";
import { Mode } from "@/type/mode";
import { RWParams } from "@/url";

export function TellerMode() {
    const [mode, set_mode] = useTellerMode();
    return <Div
        class="btn-group" role="group"
    >
        {SupplySelector([mode, set_mode])}
        {BorrowSelector([mode, set_mode])}
    </Div>;
}
function SupplySelector(
    [mode, set_mode]: ReturnType<typeof useTellerMode>
) {
    function fill(mode: Mode) {
        return mode !== Mode.supply ? "-fill" : "";
    }
    function btn_class(mode: Mode) {
        if (mode !== Mode.supply) {
            return "btn-outline-secondary";
        } else {
            return "btn-secondary";
        }
    }
    return <Button
        class={[
            "focus-ring", "focus-ring-secondary",
            "btn", btn_class(mode), "w-50",
            "border-secondary-subtle",
        ]}
        onClick={() => {
            RWParams.mode = Mode.supply;
            set_mode(Mode.supply);
        }}
        id="teller-mode-supply"
        type="button"
    >
        <I class={[
            `bi bi-piggy-bank${fill(mode)}`,
            "float-start"
        ]} />
        Supply
    </Button>;
}
function BorrowSelector(
    [mode, set_mode]: ReturnType<typeof useTellerMode>
) {
    function fill(mode: Mode) {
        return mode !== Mode.borrow ? "-fill" : "";
    }
    function btn_class(mode: Mode) {
        if (mode !== Mode.borrow) {
            return "btn-outline-secondary";
        } else {
            return "btn-secondary";
        }
    }
    return <Button
        class={[
            "focus-ring", "focus-ring-secondary",
            "btn", btn_class(mode), "w-50",
            "border-secondary-subtle",
        ]}
        onClick={() => {
            RWParams.mode = Mode.borrow;
            set_mode(Mode.borrow);
        }}
        type="button"
    >
        <I class={[
            `bi bi-credit-card${fill(mode)}`,
            "float-end"
        ]} />
        Borrow
    </Button>;
}
export default TellerMode;

import "./form-amount.scss";

import { cap, fixed, nomobi } from "@/function";
import { Div, Input, Label } from "@/react/element";
import { usePortfolioAmountRange, useTellerAmount } from "@/react/hook";
import { Amount, Mode } from "@/type";
import { useEffect, useRef, useState } from "react";

/**
 * Soft clamp: snap to lower bound when within 1%
 */
const SOFT_CLAMP_LOWER = 0.99;
/**
 * Soft clamp: snap to upper bound when within 1%
 */
const SOFT_CLAMP_UPPER = 1.01;
/**
 * Fraction of step used for nudging off a bound
 */
const NUDGE_FACTOR = 0.01;

export function FormAmount(
    { mode }: { mode: Mode }
) {
    const $ref = useRef<HTMLInputElement>(null);
    const [amount, set_amount] = useTellerAmount(mode);
    const [min, max, step] = usePortfolioAmountRange(mode);
    const [raw, set_raw] = useState(truncate_digits(amount));
    useEffect(() => {
        amount !== Number(raw) && set_raw(truncate_digits(amount));
    }, [
        amount,
        raw,
    ]);
    return <Div
        class="form-floating"
    >
        <Input ref={$ref}
            autoFocus={nomobi()}
            id="teller-amount"
            class={[
                "focus-ring focus-ring-secondary",
                "form-control", "teller-amount",
            ]}
            onChange={(e) => {
                const num_value = Number(e.target.value);
                const lhs_value = Math.max(min, num_value);
                const rhs_value = Math.min(max, lhs_value);
                if (rhs_value !== amount) {
                    set_amount(rhs_value);
                }
                set_raw(e.target.value);
            }}
            onDoubleClick={() => {
                $ref.current?.select();
            }}
            onFocus={(e) => {
                if (e.target.value === "0") {
                    e.target.select();
                }
            }}
            onBlur={(e) => {
                if (e.target.value === "") {
                    set_raw("0");
                }
            }}
            onWheel={onWheel(
                [amount, set_amount],
                [min, max, step],
            )}
            step={truncate_digits(step)}
            min={min} max={max}
            type="number"
            value={raw}
        />
        <Label htmlFor="teller-amount">
            {`${cap(mode)} Amount`}
        </Label>
    </Div>;
}
function truncate_digits(
    amount: Amount | null, digits = 6,
) {
    return fixed(amount ?? 0, digits);
}
function onWheel(
    [amount, set_amount]: ReturnType<
        typeof useTellerAmount
    >,
    [min, max, step]: ReturnType<
        typeof usePortfolioAmountRange
    >,
) {
    if (amount === null) {
        amount = 0;
    }
    return (
        e: React.WheelEvent<HTMLInputElement>
    ) => {
        // [+]-wheeling and amount near max:
        const inc = Math.sign(e.deltaY) < 0;
        if (inc && amount + step > max * SOFT_CLAMP_LOWER) {
            set_amount(max); // clamp to max!
            return;
        }
        // [-]-wheeling and amount near min:
        const dec = Math.sign(e.deltaY) > 0;
        if (dec && amount - step < min * SOFT_CLAMP_UPPER) {
            set_amount(min); // clamp to min!
            return;
        }
        // [+]-wheeling and amount at min:
        if (inc && amount <= min) {
            set_amount(amount + step * NUDGE_FACTOR);
            return;
        }
        // [-]-wheeling and amount at max:
        if (dec && amount >= max) {
            set_amount(amount - step * NUDGE_FACTOR);
            return;
        }
    };
}
export default FormAmount;

import { Sector } from "@/component";
import { UNIT } from "@/constant";
import { buffered, cap as CAP, EXP_FORMAT, KMG_FORMAT, mobile, NUM_FORMAT } from "@/function";
import { SVG } from "@/image";
import { Button, Div, I, Input, P, Pulsar, Span } from "@/react/element";
import { usePool, useWalletAccount } from "@/react/hook";
import { Address, Mode, Pool, PoolToken, Position, RateInfo, RateModel, Symbol, Util } from "@/type";
import { useState } from "react";
import { IconButton } from "../lib.button";
import { TxRunner } from "./tx-runner";
import moment from "moment";

export function PortfolioBody({
    tokens, portfolio, model_map, rate_map, mode, pool
}: {
    tokens: Address[] | null;
    portfolio: Position[] | null;
    rate_map: Map<PoolToken, RateInfo> | null;
    model_map: Map<PoolToken, RateModel> | null;
    mode: Mode;
    pool: Pool;
}) {
    return <Div id="portfolio-body" class={[
        "portfolio-body accordion",
    ]}>
        {tokens?.map((ta, i) => {
            const pool_token = PoolToken.from(pool, ta);
            const position = portfolio?.[i] ?? Position.from(ta);
            const rate = rate_map?.get(pool_token) ?? RateInfo.init();
            const model = model_map?.get(pool_token) ?? RateModel.init();
            return <Div key={i} class={[
                "accordion-item"
            ]}>
                <Div class={[
                    "accordion-header",
                ]}>
                    <PortfolioPosition
                        position={position}
                        model={model}
                        rate={rate}
                        mode={mode}
                        index={i}
                    />
                </Div>
                <Div id={`accordion-body-${i}`} class={[
                    "accordion-collapse",
                    "accordion-body",
                    "collapse",
                ]}>
                    <Div class="text-center text-muted fs-1">
                        <I class="bi bi-tools" title="Coming soon…" />
                    </Div>
                </Div>
            </Div>;
        })}
    </Div>;
}
function PortfolioPosition({
    position, model, rate, mode, index,
}: {
    position: Position;
    model: RateModel;
    rate: RateInfo;
    index: number;
    mode: Mode;
}) {
    return <Div class={[
        "d-flex justify-content-between",
    ]}>
        <Div class={[
            "lhs d-flex align-items-center w-50",
        ]}>
            <PositionToggle
                position={position}
                index={index}
                rate={rate}
                mode={mode}
            />
            <PositionLabel
                position={position}
                rate={rate}
                mode={mode}
            />
            <PositionAmount
                position={position}
                mode={mode}
            />
        </Div>
        <Div class={[
            "rhs d-flex align-items-center w-50",
        ]}>
            <PositionAtSign />
            <PositionRate
                position={position}
                model={model}
                rate={rate}
                mode={mode}
            />
            <PositionHandle
                position={position}
                mode={mode}
            />
        </Div>
    </Div>;
}
function PositionToggle({ position, rate, mode, index }: {
    position: Position;
    rate: RateInfo;
    mode: Mode;
    index: number;
}) {
    const label_title = PositionLabelTitle(position, mode);
    const { symbol } = position;
    return <>
        <IconButton
            class={[
                "focus-ring", "focus-ring-secondary",
                "btn", "btn-outline-secondary",
                "d-none d-sm-inline",
                "btn-toggle",
            ]}
            data-bs-target={`#accordion-body-${index}`}
            // data-bs-toggle="collapse"
            icon="bi-caret-right"
            icon-suffix="-fill"
            type="button"
        />
        <Button
            class={[
                "focus-ring", "focus-ring-secondary",
                "btn", "btn-outline-secondary",
                "d-inline d-sm-none",
                "btn-toggle",
            ]}
            data-bs-target={`#accordion-body-${index}`}
            // data-bs-toggle="collapse"
            type="button"
        >
            <Span title={label_title} bs-html="true">
                <Span style={{ position: "relative" }}>
                    <SVG icon={symbol} height={16} width={16} />
                    <IconSector position={position} rate={rate} />
                </Span>
            </Span>
        </Button>
    </>
}
function PositionLabel({ position, rate, mode }: {
    position: Position;
    rate: RateInfo;
    mode: Mode;
}) {
    const icon_title = PositionIconTitle(position, rate);
    const text_title = PositionLabelTitle(position, mode)
    const { symbol } = position;
    return <Div class={[
        "d-none d-sm-block",
        "text-center px-2",
    ]}>
        <Div class={[
            "d-flex align-items-center gap-1",
        ]}>
            <Span
                style={{ position: "relative" }}
                title={icon_title} bs-html="true"
            >
                <SVG icon={symbol} height={16} width={16} />
                <IconSector position={position} rate={rate} />
            </Span>
            <Span class="text" title={text_title} bs-html="true">
                {text_of(symbol)}
            </Span>
        </Div>
    </Div>;
    function text_of(symbol: Symbol) {
        if (symbol !== Symbol.NONE) {
            return <Span>{symbol}</Span>;
        }
        return <P class="placeholder-glow">
            <Span class="placeholder py-2 pe-5"></Span>
        </P>;
    }
}
function PositionIconTitle(
    position: Position,
    rate: RateInfo,
) {
    const percent = ({ value: percentage }: Util) => {
        return NUM_FORMAT(1)(100 * percentage / UNIT) + '%';
    };
    return `<div style="text-align: left;">
        <strong>${position.symbol} Utilization</strong>
        <div class="d-flex justify-content-between small mt-1">
            <span>󠀥🌊&nbsp;Percentage:&nbsp;</span>
            <span>${percent(rate.util)}</span>
        </div>
    </div>`;
}
function PositionLabelTitle(
    position: Position,
    mode: Mode,
) {
    const { symbol } = position;
    const modal = CAP(Mode.modal(mode));
    const amount = Position.supply(position);
    const amount_fmt = KMG_FORMAT(2)(amount);
    const locked = Position.lockedTotal(position);
    const locked_fmt = KMG_FORMAT(2)(locked);
    const liquid = amount - locked;
    const liquid_fmt = KMG_FORMAT(2)(liquid);
    const [cap, dt] = Position.capTotal(position, mode);
    const cap_fmt = cap < 1e12 ? KMG_FORMAT(2)(cap) : EXP_FORMAT(2)(cap);
    const dt_fmt = dt ? moment.duration(dt, "seconds").humanize(true) : "&mdash;";
    return `<div style="text-align: left;">
        <strong>All ${modal} ${symbol}</strong>
        <div class="d-flex justify-content-between small mt-1">
            <span>#️⃣&nbsp;Amount:&nbsp;</span>
            <span>${amount_fmt}</span>
        </div>
        <div class="d-flex justify-content-between small">
            <span>🔒&nbsp;Locked:&nbsp;</span>
            <span>${locked_fmt}</span>
        </div>
        <div class="d-flex justify-content-between small mb-1">
            <span>💦&nbsp;Liquid:&nbsp;</span>
            <span>${liquid_fmt}</span>
        </div>
        <strong>Total Cap Limit</strong>
        <div class="d-flex justify-content-between small mt-1">
            <span>🛑&nbsp;Max:&nbsp;</span>
            <span>${cap_fmt.replace(/e\+/, "E+")}</span>
        </div>
        <div class="d-flex justify-content-between small">
            <span>${dt ? "⏳" : "⌛"}&nbsp;Till:&nbsp;</span>
            <span>${dt_fmt}</span>
        </div>
    </div>`;
}
function IconSector({ position, rate }: {
    position: Position;
    rate: RateInfo;
}) {
    const deg = (util: Util) => {
        return 360 * util.value / UNIT;
    };
    const off = (util: Util) => {
        return 180 - deg(util) / 2;
    };
    const symbol = position.symbol.toLowerCase();
    const top = mobile(1.25, 1.75);
    return <Sector
        stroke={{ color: `var(--xp-${symbol}-color)` }}
        length={deg(rate.util)} start={off(rate.util)}
        radius={10} style={{ top: `calc(50% + ${top}px)` }}
    />;
}
function PositionAmount({ position, mode }: {
    position: Position;
    mode: Mode;
}) {
    const amount = NUM_FORMAT(2)(
        Position.amount(position)
    );
    const title = PositionAmountTitle(
        position, mode
    );
    return <Input
        bs-html="true"
        class={[
            "focus-ring", "focus-ring-secondary",
            "form-control", "text-end",
            "ps-1", "pe-2",
        ]}
        name="position-amount"
        readOnly
        value={amount}
        title={title}
        type="text"
    />;
}
function PositionAmountTitle(
    position: Position,
    mode: Mode,
) {
    const modal = CAP(Mode.modal(mode));
    const amount = Position.amount(position);
    const amount_fmt = KMG_FORMAT(2)(amount);
    const locked = Position.locked(position);
    const locked_fmt = KMG_FORMAT(2)(locked);
    const liquid = amount - locked;
    const liquid_fmt = KMG_FORMAT(2)(liquid);
    const [cap, dt] = Position.cap(position, mode);
    const cap_fmt = cap < 1e12 ? KMG_FORMAT(2)(cap) : EXP_FORMAT(2)(cap);
    const dt_fmt = dt ? moment.duration(dt, "seconds").humanize(true) : "&mdash;";
    return `<div style="text-align: center;">
        <strong>My ${modal} ${position.symbol}</strong>
        <div class="d-flex justify-content-between small mt-1">
            <span>#️⃣&nbsp;Amount:&nbsp;</span>
            <span>${amount_fmt}</span>
        </div>
        <div class="d-flex justify-content-between small">
            <span>🔒&nbsp;Locked:&nbsp;</span>
            <span>${locked_fmt}</span>
        </div>
        <div class="d-flex justify-content-between small mb-1">
            <span>💦&nbsp;Liquid:&nbsp;</span>
            <span>${liquid_fmt}</span>
        </div>
        <strong>My Cap Limit</strong>
        <div class="d-flex justify-content-between small mt-1">
            <span>🛑&nbsp;Max:&nbsp;</span>
            <span>${cap_fmt.replace(/e\+/, "E+")}</span>
        </div>
        <div class="d-flex justify-content-between small">
            <span>${dt ? "⏳" : "⌛"}&nbsp;Till:&nbsp;</span>
            <span>${dt_fmt}</span>
        </div>
    </div>`;
}
function PositionAtSign() {
    return <Div class={[
        "at-sign text-center ps-2 pe-1",
    ]}>
        <Span class="text">@</Span>
    </Div>;
}
function PositionRate({ position, model, rate, mode }: {
    position: Position;
    model: RateModel;
    rate: RateInfo;
    mode: Mode;
}) {
    const percent = (usb: RateInfo) => {
        if (usb && mode === Mode.supply) {
            return 100 * usb.sura / UNIT;
        }
        if (usb && mode === Mode.borrow) {
            return 100 * usb.bora / UNIT;
        }
        return 0;
    };
    const apy = NUM_FORMAT(2)(percent(rate));
    const title = PositionRateTitle(position, model, mode);
    return <>
        <Input
            bs-html="true"
            class={[
                "focus-ring", "focus-ring-secondary",
                "d-block d-sm-none",
                "form-control",
                "text-center",
                "px-0",
            ]}
            name="position-rate"
            readOnly
            value={`${apy}%`}
            title={title}
            type="text"
        />
        <Input
            bs-html="true"
            class={[
                "focus-ring", "focus-ring-secondary",
                "d-none d-sm-block",
                "form-control",
                "text-center",
                "px-0",
            ]}
            name="position-rate"
            readOnly
            value={`${apy}% APY`}
            title={title}
            type="text"
        />
    </>;
}
function PositionRateTitle(
    position: Position,
    irm: RateModel,
    mode: Mode,
) {
    const percent = (value: number) => {
        return NUM_FORMAT(1)(100 * value / UNIT) + '%';
    };
    return `<div style="text-align: left;">
        <strong>${position.symbol} ${CAP(mode)} Rate</strong>
        <div class="d-flex justify-content-between small mt-1">
            <span>󠀥🌊&nbsp;Kink Utilization:&nbsp;</span>
            <span>${percent(irm.util)}</span>
        </div>
        <div class="d-flex justify-content-between small">
            <span>󠀥📐&nbsp;Kink Yield:&nbsp;</span>
            <span>${percent(irm.rate)}</span>
        </div>
        <div class="d-flex justify-content-between small">
            <span>󠀥↕️&nbsp;Spread:&nbsp;</span>
            <span>±${percent(irm.spread)}</span>
        </div>
    </div>`;
}
function PositionHandle({ position, mode }: {
    position: Position;
    mode: Mode;
}) {
    const [pulse, set_pulse] = useState(false);
    const [account] = useWalletAccount();
    const [pool] = usePool();
    return <Pulsar
        class={[
            "focus-ring", "focus-ring-secondary",
            "btn btn-secondary btn-handle",
            "flex-shrink-0",
            "w-50",
        ]}
        onClick={buffered(async (ev) => {
            set_pulse(true);
            try {
                await TxRunner(account, pool, mode, {
                    amount: null, position,
                    ctrl: ev.ctrlKey,
                });
            } finally {
                set_pulse(false);
            }
        })}
        title={HandleTitle(position, mode)}
        bs-placement="left"
        pulse={pulse}
        type="button"
    >
        <HandleLabel mode={mode} />
    </Pulsar>;
}
function HandleTitle(
    position: Position,
    mode: Mode,
) {
    const { symbol } = position;
    switch (mode) {
        case Mode.supply:
            return `Redeem ${symbol}`;
        case Mode.borrow:
            return `Settle ${symbol}`;
    }
}
function HandleLabel({ mode }: {
    mode: Mode;
}) {
    switch (mode) {
        case Mode.supply:
            return <LabelRedeem />;
        case Mode.borrow:
            return <LabelSettle />;
    }
}
function LabelRedeem() {
    const icon = () => {
        return <I class="bi bi-box-arrow-down" />;
    };
    return <>
        <Span class="d-none d-sm-inline text me-1">
            Redeem
        </Span>
        <Span class="d-none d-sm-inline float-end">
            {icon()}
        </Span>
        <Span class="d-inline d-sm-none">
            {icon()}
        </Span>
    </>;
}
function LabelSettle() {
    const icon = () => {
        return <I class="bi bi-box-arrow-in-up" />;
    };
    return <>
        <Span class="d-none d-sm-inline text me-1">
            Settle
        </Span>
        <Span class="d-none d-sm-inline float-end">
            {icon()}
        </Span>
        <Span class="d-inline d-sm-none">
            {icon()}
        </Span>
    </>;
}
export default PortfolioBody;

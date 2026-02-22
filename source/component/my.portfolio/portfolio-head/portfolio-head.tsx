import { EXP_FORMAT, NUM_FORMAT } from "@/function";
import { Div, I, Span } from "@/react/element";
import { Health, Mode, Rate } from "@/type";

export function PortfolioHead({ health, apy, mode }: {
    health: Health | null;
    apy: Rate | null;
    mode: Mode;
}) {
    const lhs_header = () => {
        if (mode === Mode.supply) {
            return <Span>Supply Positions</Span>;
        } else {
            return <Span>Borrow Positions</Span>;
        }
    };
    const rhs_header = () => {
        return <Span class={[
            "justify-content-between",
            "d-flex",
            "gap-1",
        ]}>
            <PortfolioHealth health={health} />
            <PortfolioAPY apy={apy} />
        </Span>;
    };
    return <Div class={[
        "justify-content-between",
        "align-items-center",
        "portfolio-head",
        "d-flex",
        "pb-1",
    ]}>
        <Span class="portfolio-head-lhs px-1">
            {lhs_header()}
        </Span>
        <Span class="portfolio-head-rhs px-1">
            {rhs_header()}
        </Span>
    </Div>;
}
function PortfolioHealth({ health }: {
    health: Health | null;
}) {
    let ratio = health ? Health.ratio(health) : null;
    if (ratio === null || !isFinite(ratio)) {
        ratio = 0;
    }
    const value_exp = EXP_FORMAT(1)(ratio).toUpperCase();
    const value_pct = NUM_FORMAT(1)(100 * ratio) + "%";
    const value = ratio > 100 ? value_exp : value_pct;
    const heart = (ratio: number) => {
        if (ratio > 1.5 || !ratio) {
            return "heart-pulse-fill";
        }
        if (ratio > 1.0) {
            return "heartbreak-fill";
        }
        return "heart";
    };
    const state = (ratio: number) => {
        if (ratio > 1.5) {
            return ": Good ❤️‍🔥";
        }
        if (ratio > 1.0) {
            return ": Risk ☢️";
        }
        if (ratio > 0.0) {
            return ": R.I.P. 💀";
        }
        return "";
    };
    return <Span
        title={`Portfolio Health${state(ratio)}`}
        aria-live="polite" aria-atomic="true"
    >
        <I class={`bi bi-${heart(ratio)} me-1`} />
        <Span>{value}</Span>
    </Span>;
};
function PortfolioAPY({ apy }: {
    apy: Rate | null;
}) {
    if (apy === null || !isFinite(apy)) {
        apy = 0;
    }
    const sfx = apy >= 0 ? "up" : "down";
    const pct = NUM_FORMAT(1)(100 * apy) + "%";
    const dir = (apy: Rate) => {
        if (apy > 0) {
            return ": Positive ↗️";
        }
        if (apy < 0) {
            return ": Negative ↘️";
        }
        return "";
    };
    return <Span
        title={`Portfolio APY${dir(apy)}`}
        aria-live="polite" aria-atomic="true"
    >
        <Span class="d-none d-sm-block">
            <Span>{pct}</Span>
            <I class={`bi bi-caret-${sfx}-square-fill ms-1`} />
        </Span>
        <Span class="d-block d-sm-none">
            <I class={`bi bi-caret-${sfx}-square-fill me-1`} />
            <Span>{pct}</Span>
        </Span>
    </Span>;
};
export default PortfolioHead;

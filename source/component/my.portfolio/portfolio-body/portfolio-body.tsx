import { Address, LockParams, Mode, Pool, PoolList, PoolToken, Position, RateInfo, RateModel } from "@/type";
import { memo } from "react";

import { ErrorUi } from "@/component/lib.error-ui";
import { Div, Span } from "@/react/element";

import { PositionAmount } from "./position-amount";
import { PositionCharts } from "./position-charts";
import { PositionHandle } from "./position-handle";
import { PositionLabel } from "./position-label";
import { PositionLock } from "./position-lock";
import { PositionRate } from "./position-rate";
import { PositionToggle } from "./position-toggle";

export function PortfolioBody({
    tokens, portfolio, model_map, rate_map, lock_params_map, mode, pool,
}: {
    tokens: Address[] | null;
    portfolio: Position[] | null;
    rate_map: Map<PoolToken, RateInfo> | null;
    model_map: Map<PoolToken, RateModel> | null;
    lock_params_map: Map<PoolToken, LockParams> | null;
    mode: Mode;
    pool: Pool;
}) {
    return <Div id="portfolio-body" class={[
        "portfolio-body accordion",
    ]}>
        {tokens?.map((ta, i) => {
            const pool_token = PoolToken.from(pool, ta);
            const target_position = portfolio?.[i] ?? Position.from(ta);
            const source_position = i > 0
                ? portfolio?.[0] ?? Position.from(tokens[0]!)
                : portfolio?.[1] ?? Position.from(tokens[1]!);
            const rate = rate_map?.get(pool_token) ?? RateInfo.init();
            const model = model_map?.get(pool_token) ?? RateModel.init();
            const lock_params = lock_params_map?.get(pool_token) ?? LockParams.init();
            return <Div key={i} class={[
                "accordion-item",
            ]}>
                <Div class={[
                    "accordion-header",
                ]}>
                    <PortfolioPosition
                        position={target_position}
                        lock_params={lock_params}
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
                ]} >
                    <ErrorUi>
                        <PositionCharts
                            db_index={PoolList.indexOf(pool)}
                            source={source_position}
                            target={target_position}
                            range={[
                                new Date(Date.now() - 90 * 86_400_000),
                                new Date(),
                            ]}
                            index={i}
                        />
                    </ErrorUi>
                </Div>
            </Div>;
        })}
    </Div>;
}
const PortfolioPosition = memo(function PortfolioPosition({
    position, lock_params, model, rate, mode, index,
}: {
    position: Position;
    lock_params: LockParams;
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
                lock_params={lock_params}
                model={model}
                rate={rate}
                mode={mode}
            />
            <PositionLock
                position={position} mode={mode}
            />
            <PositionHandle
                position={position}
                mode={mode}
            />
        </Div>
    </Div>;
});
function PositionAtSign() {
    return <>
        <Div class={[
            "at-sign", "text-center", "ps-2 pe-1",
        ]}>
            <Span class="text">@</Span>
        </Div>
    </>;
}
export default PortfolioBody;

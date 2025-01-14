import "./my-portfolio.scss";

import { Div } from "@/react/element";
import { usePool, usePoolRateInfos, usePoolRateModels, usePoolTokens, usePortfolio, usePortfolioHealth, usePortfolioYield, useTellerFlag, useTellerMode } from "@/react/hook";
import { PortfolioBody } from "./portfolio-body";
import { PortfolioHead } from "./portfolio-head";

export function MyPortfolio() {
    const [pool] = usePool();
    const [show] = useTellerFlag();
    const [mode] = useTellerMode();
    const [tokens] = usePoolTokens();
    const [rate_map] = usePoolRateInfos();
    const [model_map] = usePoolRateModels();
    const [portfolio] = usePortfolio(mode);
    const [portfolio_health] = usePortfolioHealth();
    const [portfolio_yield] = usePortfolioYield();
    return <Div
        class={!show ? "d-none" : ""}
        id="my-portfolio"
    >
        <PortfolioHead
            health={portfolio_health}
            apy={portfolio_yield}
            mode={mode}
        />
        <PortfolioBody
            portfolio={portfolio}
            model_map={model_map}
            rate_map={rate_map}
            tokens={tokens}
            mode={mode}
            pool={pool}
        />
    </Div>;
}
export default MyPortfolio;

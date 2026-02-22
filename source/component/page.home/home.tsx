import { Div } from "@/react/element";

import {
    ErrorUi,
    MyPortfolio,
    TellerExec,
    TellerForm,
    TellerMode,
    TellerPool,
    TellerRange
} from "@/component";

export function Home() {
    return <Div class={[
        "home-page",
    ]}>
        <Div class="row p-1">
            <Div role="group" class={[
                "btn-group-vertical"
            ]}>
                <TellerPool />
                <TellerMode />
            </Div>
        </Div>
        <Div class="row p-1">
            <TellerForm />
        </Div>
        <Div class="row p-0 px-3">
            <TellerRange />
        </Div>
        <Div class="row p-1">
            <TellerExec />
        </Div>
        <Div class="row p-1">
            <ErrorUi>
                <MyPortfolio />
            </ErrorUi>
        </Div>
    </Div>;
}
export default Home;

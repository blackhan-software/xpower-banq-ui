import { Div, Span } from "@/react/element";
import { AppWallet } from "./app-wallet";
import { SVG } from "@/image";

export function AppNavbar() {
    return <Div class={[
        "d-flex",
        "w-100",
    ]}>
        <Div class={[
            "navbar-brand mb-0 h1",
            "align-items-center",
            "d-none d-sm-flex",
            "w-100",
        ]}>
            <Span class="float-end me-1" >
                <SVG icon="BANQ-fff"
                    width={28} height={28}
                    style={{ borderRadius: 0 }}
                />
            </Span>
            <Span>&nbsp;XPower Banq</Span>
        </Div>
        <Div class={[
            "flex-grow-1",
        ]}>
            <AppWallet />
        </Div>
    </Div>;
}
export default AppNavbar;

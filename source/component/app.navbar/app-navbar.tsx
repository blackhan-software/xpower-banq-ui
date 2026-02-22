import { WHITEPAPER_URL } from "@/constant";
import { A, Div, Span } from "@/react/element";
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
            <Span>&nbsp;XPower Banq|<A class={[
                "link-underline-opacity-75-hover",
                "link-underline-opacity-0",
                "link-body-emphasis",
            ]}
                href={WHITEPAPER_URL}
                target="_blank"
            >Whitepaper</A></Span>
        </Div>
        <Div class={[
            "flex-grow-1",
        ]}>
            <AppWallet />
        </Div>
    </Div>;
}
export default AppNavbar;

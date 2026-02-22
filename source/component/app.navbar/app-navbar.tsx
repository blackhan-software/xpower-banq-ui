import { WHITEPAPER_URL, DOCS_URL } from "@/constant";
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
            <Span>
                <HomeLink />
                <MemoLink />
                <DocsLink />
            </Span>
        </Div>
        <Div class={[
            "flex-grow-1",
        ]}>
            <AppWallet />
        </Div>
    </Div>;
}
function HomeLink() {
    return <>&nbsp;<A class={[
        "link-underline-opacity-75-hover",
        "link-underline-opacity-0",
        "link-body-emphasis",
    ]}
        href="/"
    >XPower Banq</A></>;
}
function MemoLink() {
    if (WHITEPAPER_URL) {
        return <>|<A class={[
            "link-underline-opacity-75-hover",
            "link-underline-opacity-0",
            "link-body-emphasis",
        ]}
            href={WHITEPAPER_URL}
            target="_blank"
        >Whitepaper</A></>;
    }
    return null;
}
function DocsLink() {
    if (DOCS_URL) {
        return <>|<A class={[
            "link-underline-opacity-75-hover",
            "link-underline-opacity-0",
            "link-body-emphasis",
        ]}
            href={DOCS_URL}
            target="_blank"
        >Docs</A></>;
    }
    return null;
}
export default AppNavbar;

import "./app-footer.scss";

import { appVersion } from "@/app-version";
import { ChainId } from "@/blockchain";
import { WHITEPAPER_URL, DOCS_URL } from "@/constant";
import { I, Span } from "@/react/element";
import { useErrors, usePoolContract, usePositionContract, useTellerMode, useTellerToken, useVaultContract, useWalletChainId } from "@/react/hook";
import { RETRY_REGISTRY } from "@/zustand/service/action-guard";
import { useMemo, useState } from "react";
import { Link, MultiLink } from "./link";
import { TermsLink } from "./terms";

export function AppFooter() {
    return <>
        <Span class="me-auto">
            <Span>&copy;&nbsp;{year()}</Span>
            <Span class="d-none d-sm-inline">
                <Span title={COMPANY_TITLE}>&nbsp;Moorhead LLC</Span>
                <Span>&nbsp;|</Span>
                <Span>&nbsp;v{appVersion()}-beta</Span>
            </Span>
        </Span>
        <Span class={[
            "translate-middle-x",
            "position-absolute",
            "start-50",
            "d-flex",
            "gap-1",
        ]}>
            <Link href="https://t.me/xpowermine">
                <I title="Telegram" class="bi bi-telegram" />
            </Link>
            <Link href="https://twitter.com/xpowermine">
                <I title="Twitter" class="bi bi-twitter-x" />
            </Link>
            <Link href="https://discord.gg/43ChQHEvzV">
                <I title="Discord" class="bi bi-discord" />
            </Link>
            <PoolLink />
            <PositionLink />
            <VaultLink />
            <MemoLink />
            <DocsLink />
        </Span>
        <Span class="ms-auto">
            <TermsLink />
            <Span>&nbsp;|&nbsp;</Span>
            <AvalancheLink />
        </Span>
    </>;
}
function PoolLink() {
    const [pool] = usePoolContract();
    const [chain] = useWalletChainId();
    return <MultiLink hrefs={pool ? [
        `https://${subdomain(chain)}snowscan.xyz/address/${pool.target}`,
        `https://${subdomain(chain)}snowtrace.io/address/${pool.target}`,
    ] : []}>
        <I title="Pool" class="bi bi-cpu-fill" />
    </MultiLink>;
}
function PositionLink() {
    const [mode] = useTellerMode();
    const [token] = useTellerToken();
    const [chain] = useWalletChainId();
    const [position] = usePositionContract(mode, token);
    const [symbol, set_symbol] = useState<string | null>(null);
    useMemo(() => {
        position?.symbol().then(set_symbol);
    }, [
        position,
    ]);
    return <MultiLink hrefs={position?.target ? [
        `https://${subdomain(chain)}snowscan.xyz/address/${position.target}`,
        `https://${subdomain(chain)}snowtrace.io/address/${position.target}`,
    ] : []}>
        <I title={`${symbol} Position`} class={[
            `bi bi-motherboard-fill`
        ]} />
    </MultiLink>;
}
function VaultLink() {
    const [token] = useTellerToken();
    const [chain] = useWalletChainId();
    const [vault] = useVaultContract(token);
    return <MultiLink hrefs={vault?.target ? [
        `https://${subdomain(chain)}snowscan.xyz/address/${vault.target}`,
        `https://${subdomain(chain)}snowtrace.io/address/${vault.target}`,
    ] : []}>
        <I title={`${token.symbol} Vault`} class={[
            "bi bi-safe-fill"
        ]} />
    </MultiLink>;
}
function MemoLink() {
    if (WHITEPAPER_URL) {
        return <Link href={WHITEPAPER_URL}>
            <I title="Whitepaper" class="bi bi-journal-album" />
        </Link>;
    }
    return null;
}
function DocsLink() {
    if (DOCS_URL) {
        return <Link href={DOCS_URL}>
            <I title="Docs" class="bi bi-info-square-fill" />
        </Link>;
    }
    return null;
}
function AvalancheLink() {
    const [errors, set_error] = useErrors();
    if (errors.size) {
        const details = Array.from(errors.entries())
            .map(([k, e]) => `[${k}] ${e.message}`).join("\n");
        const tooltip = Array.from(errors.entries())
            .map(([k, e]) => `[${k}] ${e.message}`).join("<br>");
        return <Span
            title={tooltip}
            bs-html="true"
            role="button"
            onClick={() => {
                navigator.clipboard.writeText(details);
                RETRY_REGISTRY.retryAll();
                for (const k of errors.keys()) {
                    set_error(k, null);
                }
            }}
        >&#x26a0;&#xfe0f;</Span>;
    }
    return <Link href="https://www.avalabs.org/">
        <I title="Powered by Avalanche" class={[
            "bi bi-triangle-fill", "avalanche"
        ]} />
    </Link>;
}
function subdomain(chain: ChainId | null): string {
    if (chain === ChainId.AVALANCHE_FUJI) {
        return "testnet.";
    }
    return "";
}
function year() {
    return new Date().getFullYear();
}
const COMPANY_TITLE = [
    "P.O. Box 2255", "Shedden Road", "Georgetown",
    "Grand Cayman KY1-1107", "KY"
].join(", ");
export default AppFooter;

import { memoized } from "@/function";
import { Button, I } from "@/react/element";
import { Tooltip } from "bootstrap";
import { sha256 } from "ethers";
import QR from "qrcode";
import { useEffect, useState } from "react";

export function QRCode(
    { data, ...props }:
        & { data: string }
        & Parameters<typeof Button>[0],
) {
    const [url, set_url] = useState(data);
    useEffect(() => {
        const tt = createTip();
        return () => tt?.dispose();
    }, [data]);
    useEffect(() => {
        QR.toDataURL(data, (e, u) => set_url(!e ? u : ""));
    }, [data]);
    if (data) {
        const title = `<img class='px-1 py-2' src='${url}'>`;
        return <Button
            data-bs-original-title={title}
            data-bs-placement="bottom"
            data-bs-toggle="tooltip"
            data-bs-html="true"
            aria-label="QR code"
            onClick={toggleTip}
            key={keyOf(data)}
            {...props}
        >
            <I class="bi bi-qr-code"></I>
        </Button>;
    } else {
        return <Button {...props}>
            <I class="bi bi-qr-code"></I>
        </Button>;
    }
}
function createTip(): Tooltip | null {
    const $tt = document.querySelector<HTMLElement>(
        '.qr-code[data-bs-toggle="tooltip"]',
    );
    return $tt ? new Tooltip($tt) : null;
}
function toggleTip() {
    const $tt = document.querySelector<HTMLElement>(
        '.qr-code[data-bs-toggle="tooltip"]',
    );
    if ($tt) {
        if ($tt.getAttribute("aria-describedby")) {
            Tooltip.getInstance($tt)?.hide();
        } else {
            Tooltip.getInstance($tt)?.show();
        }
    }
}
const keyOf = memoized((data: string) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    const hash = sha256(bytes);
    return BigInt(hash);
}, (d: string) => d);
export default QRCode;

import "./app-consent.scss";

import { A, Button, Div, P } from "@/react/element";
import { useEffect, useState } from "react";
import { FadeIn } from "../lib.fade-in";

export const AppConsent = ({
    href = "https://cookie-consent.app.forthe.top/why-websites-use-cookies/",
    key = "app-consent",
}) => {
    const [show, set_show] = useState(false);
    useEffect(() => {
        const accepted = localStorage.getItem(key);
        if (!accepted) set_show(true);
    }, []);
    const accept = () => {
        localStorage.setItem(key, "accepted");
        set_show(false);
    };
    if (!show) {
        return null;
    }
    return <FadeIn>
        <Div class={["app-consent"].concat([
            "justify-content-between",
            "align-items-center",
            "translate-middle-x",
            "fixed-bottom",
            "start-50",
            "my-5 p-1",
            "rounded",
            "d-flex",
        ])}>
            <P class={[
                "text-nowrap",
                "text-white",
                "m-0 px-1",
            ]}>
                &gt; We use cookies;{" "}<A
                    class="text-white"
                    target="_blank"
                    href={href}
                >
                    see consent
                </A>.
            </P>
            <Button onClick={accept} class={[
                "btn-secondary", "border",
                "btn-sm",
                "btn",
            ]}>
                Accept
            </Button>
        </Div>
    </FadeIn>;
};
export default AppConsent;

import { Span } from '@/react/element';
import { ReactNode, useEffect, useState } from 'react';
import "./fade-in.scss";

type Props = {
    duration?: 200 | 600
};
export function FadeIn(
    { children, duration }: Props & { children: ReactNode }
) {
    const [visible, set_visible] = useState(false);
    useEffect(() => set_visible(true), []);
    if (visible) {
        return <Span class={[
            "fade-in", `fade-in-${duration ?? 200}`, "visible",
        ]}>
            {children}
        </Span>;
    }
    return <Span class={[
        "fade-in", `fade-in-${duration ?? 200}`,
    ]}>
        {children}
    </Span>;
};
export default FadeIn;

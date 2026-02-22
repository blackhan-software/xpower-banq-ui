import { Button, I } from "@/react/element";
import { Classic } from "@/react/element/enhanced";
import React from "react";

type Props = {
    "icon-suffix"?: string;
    "icon-spin"?: boolean;
    "icon": string;
};

export const IconButton = React.forwardRef((
    props: Props & React.DetailedHTMLProps<
        Classic<React.ButtonHTMLAttributes<HTMLButtonElement>>,
        HTMLButtonElement
    >,
    ref: React.ForwardedRef<HTMLButtonElement>
) => {
    const { "icon": icon, "icon-spin": spin, "icon-suffix": suffix, ...rest } = props;
    const $icon = React.useRef<HTMLElement>(null);
    const cls = cls_of(icon, spin);
    return <Button ref={ref}
        onMouseEnter={() => {
            fill($icon.current, cls, suffix)(true);
        }}
        onMouseLeave={() => {
            fill($icon.current, cls, suffix)(false);
        }}
        onFocus={() => {
            fill($icon.current, cls, suffix)(true);
        }}
        onBlur={() => {
            fill($icon.current, cls, suffix)(false);
        }}
        style={{
            pointerEvents: spin || props.disabled ? "none" : "auto",
            ...props.style,
        }}
        {...rest}
    >
        {props.children ?? <I
            ref={$icon} class={["bi", cls]}
        />}
    </Button>;
});
const cls_of = (
    icon: Props["icon"],
    spin: Props["icon-spin"],
) => {
    return !spin ? icon : "spinner-border spinner-border-sm";
};
const fill = (
    $icon: HTMLElement | null,
    icon_cls: string, suffix = "-fill",
) => (flag: boolean) => {
    const base_cls = icon_cls.replace(
        new RegExp(`${suffix}$`), ""
    );
    base_cls.split(" ").forEach((cls) => {
        $icon?.classList.toggle(`${cls}${suffix}`, flag);
        $icon?.classList.toggle(cls, !flag);
    });
};
export default IconButton;

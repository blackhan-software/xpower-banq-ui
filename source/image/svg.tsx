import React from "react";

type Props = Partial<{
    path?: string;
    icon?: string;
    height: number;
    width: number;
    style: React.CSSProperties;
}>;
export function SVG(
    { path, icon, height, width, style }: Props
) {
    const src =
        path ?? `image/svg/${icon ?? "none"}.svg`;
    if (typeof height !== "number") {
        height = 20;
    }
    if (typeof width !== "number") {
        width = 20;
    }
    if (typeof style?.borderRadius !== "number" ||
        typeof style?.borderRadius !== "string"
    ) {
        style = { borderRadius: "50%", ...style };
    }
    return <img
        alt={icon}
        height={height}
        src={src}
        style={style}
        width={width}
    />;
}
export default SVG;

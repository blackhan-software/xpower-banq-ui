import { Sector } from "@/component";
import { UNIT } from "@/constant";
import { mobile } from "@/function";
import { Position, RateInfo, Util } from "@/type";

export function IconSector({ position, rate }: {
    position: Position;
    rate: RateInfo;
}) {
    const deg = (util: Util) => {
        return 360 * util.value / UNIT;
    };
    const off = (util: Util) => {
        return 180 - deg(util) / 2;
    };
    const symbol = position.symbol.toLowerCase();
    const top = mobile(1.25, 1.75);
    return <Sector
        stroke={{ color: `var(--xp-${symbol}-color)` }}
        length={deg(rate.util)} start={off(rate.util)}
        radius={10} style={{ top: `calc(50% + ${top}px)` }}
    />;
}

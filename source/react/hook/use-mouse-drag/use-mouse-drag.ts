import React, { useEffect, useRef, useState } from "react";
import { useDoubleTap } from "../use-double-tap"

export type MouseDrag<T extends HTMLElement> = [
    number, number, React.RefObject<T>
];
/**
 * @param $ref object to an HTML element
 * @param init either an x- or y-position
 * @param xory function for either an x- or y-position
 *
 * @returns a stateful value that measures the drag on the provided
 * reference object; and another value for the *per drag* delta.
 */
export function useMouseDrag<T extends HTMLElement>(
    $ref: React.RefObject<T>, init: number,
    xory: (e: MouseEvent | TouchEvent, el: T) => number,
) {
    const [Δ, set_Δ] = useState(init); // total Δ
    const [δ, set_δ] = useState(0); // per-drag δ
    const p_ref = useRef<number | null>(null);
    const Δ_ref = useRef(init);
    const δ_ref = useRef(0);
    const xory_ref = useRef(xory);
    xory_ref.current = xory;
    useDoubleTap($ref, () => {
        Δ_ref.current = 0;
        δ_ref.current = 0;
        set_Δ(0);
        set_δ(0);
    });
    useEffect(() => {
        const el = $ref.current;
        function mousedown(e: MouseEvent | TouchEvent) {
            p_ref.current = xory_ref.current(e, el!);
        }
        function mousemove(e: MouseEvent | TouchEvent) {
            if (p_ref.current !== null) {
                δ_ref.current = p_ref.current - xory_ref.current(e, el!);
                set_δ(δ_ref.current);
            }
        }
        function mouseup(_: MouseEvent | TouchEvent) {
            Δ_ref.current += δ_ref.current;
            set_Δ(Δ_ref.current);
            p_ref.current = null;
            δ_ref.current = 0;
            set_δ(0);
        }
        el?.addEventListener("mousedown", mousedown);
        el?.addEventListener("mousemove", mousemove);
        el?.addEventListener("mouseup", mouseup);
        el?.addEventListener("touchstart", mousedown, {
            passive: false
        });
        el?.addEventListener("touchmove", mousemove, {
            passive: false
        });
        el?.addEventListener("touchend", mouseup, {
            passive: false
        });
        return () => {
            el?.removeEventListener("mousedown", mousedown);
            el?.removeEventListener("mousemove", mousemove);
            el?.removeEventListener("mouseup", mouseup);
            el?.removeEventListener("touchstart", mousedown);
            el?.removeEventListener("touchmove", mousemove);
            el?.removeEventListener("touchend", mouseup);
        };
    }, [$ref]);
    return [Δ + δ, δ, $ref] as MouseDrag<T>;
}
export default useMouseDrag;

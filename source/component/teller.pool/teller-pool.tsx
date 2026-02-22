import { buffered, nomobi } from "@/function";
import { Datalist, Div, Input, Option } from "@/react/element";
import { usePool } from "@/react/hook";
import { Pool, PoolList } from "@/type";
import { useEffect, useRef, useState } from "react";
import { useKeyUp } from "../../react/hook/use-key-up";
import { IconButton } from "../lib.button";

export function TellerPool(
    { spin_ms = 400 }
) {
    return <Div
        class="btn-group" role="group"
    >
        <PrevPool spin_ms={spin_ms} />
        <ListPool />
        <NextPool spin_ms={spin_ms} />
    </Div>;
}
export function ListPool() {
    const ref = useRef<HTMLInputElement>(null);
    const [pool, set_pool] = usePool();
    useEffect(() => {
        if (ref.current) {
            ref.current.value = Pool.name(pool);
        }
    }, [
        ref.current,
        pool,
    ]);
    return <>
        <Input
            class={[
                "border-start-0 border-end-0 border-bottom-0",
                "focus-ring", "focus-ring-secondary",
                "btn", "btn-outline-secondary",
                "border-secondary-subtle",
                "form-control",
            ]}
            onFocus={(e) => {
                e.target.value = "";
            }}
            onBlur={(e) => {
                e.target.value = Pool.name(pool);
            }}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    ref.current?.blur();
                }
            }}
            onChange={(e) => {
                const new_pool = Pool.from(
                    e.target.value
                );
                if (new_pool &&
                    new_pool !== pool
                ) {
                    set_pool(new_pool);
                }
            }}
            onWheel={buffered((e) => {
                if (e.deltaY < 0) {
                    const next = PoolList.next(pool);
                    if (next && ref.current) {
                        ref.current.value = Pool.name(next);
                        set_pool(next);
                    }
                    return;
                }
                if (e.deltaY > 0) {
                    const prev = PoolList.prev(pool);
                    if (prev && ref.current) {
                        ref.current.value = Pool.name(prev);
                        set_pool(prev);
                    }
                    return;
                }
            })}
            placeholder="Pool: Search and select…"
            defaultValue={Pool.name(pool)}
            list="teller-pools"
            spellCheck={false}
            aria-label="Select pool"
            ref={ref}
        />
        <Datalist id="teller-pools">
            {PoolList.query({ visible: true }).map(
                ({ pool }, i) => <Option key={i} value={Pool.name(pool)} />
            )}
        </Datalist>
    </>;
}
function PrevPool(
    { spin_ms }: { spin_ms: number }
) {
    const [spin, set_spin] = useState(false);
    const [pool, set_pool] = usePool();
    useKeyUp("ArrowLeft", () => {
        document.getElementById("prev-pool")?.click();
    }, {
        ctrlKey: true,
    });
    return <IconButton id="prev-pool"
        class={[
            "focus-ring", "focus-ring-secondary",
            "border-end-0 border-bottom-0",
            "btn", "btn-outline-secondary",
            "border-secondary-subtle",
        ]}
        onClick={buffered(() => {
            const prev = PoolList.prev(pool);
            if (!prev) return;
            setTimeout(
                () => set_spin(false), spin_ms
            );
            set_spin(true);
            set_pool(prev);
        })}
        title={nomobi("Previous Pool [CTRL+⬅]")}
        aria-label="Previous pool"
        icon="bi-caret-left"
        icon-spin={spin}
        type="button"
    />;
}
function NextPool(
    { spin_ms }: { spin_ms: number }
) {
    const [spin, set_spin] = useState(false);
    const [pool, set_pool] = usePool();
    useKeyUp("ArrowRight", () => {
        document.getElementById("next-pool")?.click();
    }, {
        ctrlKey: true,
    });
    return <IconButton id="next-pool"
        class={[
            "focus-ring", "focus-ring-secondary",
            "border-start-0 border-bottom-0",
            "btn", "btn-outline-secondary",
            "border-secondary-subtle",
        ]}
        onClick={buffered(() => {
            const next = PoolList.next(pool);
            if (!next) return;
            setTimeout(
                () => set_spin(false), spin_ms
            );
            set_spin(true);
            set_pool(next);
        })}
        title={nomobi("Next Pool [CTRL+➡]")}
        aria-label="Next pool"
        icon="bi-caret-right"
        icon-spin={spin}
        type="button"
    />;
}
export default TellerPool;

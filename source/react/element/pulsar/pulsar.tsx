import { Button, Div } from "@/react/element";
import "./pulsar.scss";

const SPINNER_DELAYS = [200, 300, 400] as const;
type Props = Parameters<typeof Button>[0] & {
    pulse?: boolean;
    n?: 1 | 2 | 3;
};
export const Pulsar: React.FC<Props> = (
    props: Props
) => {
    const { class: clazz, children, pulse, n = 3, ...rest } = props;
    const list = ["btn-pulsar", pulse ? "pulse" : ""];
    if (typeof clazz !== "string") {
        list.unshift(...clazz ?? []);
    } else {
        list.unshift(clazz);
    }
    return <Button class={list} {...rest}>
        {pulse ? <Spinners n={n} /> : children}
    </Button>;
};
function Spinners(
    { n }: { n: 1 | 2 | 3 },
) {
    return <>
        {SPINNER_DELAYS.slice(0, n).map((delay) =>
            <Div key={delay} class="spinner-grow m-1" role="status" style={{
                animationDuration: "1s", animationDelay: `${delay}ms`,
                width: "0.25rem", height: "0.25rem",
            }} />
        )}
    </>;
}
Pulsar.displayName = "Pulsar";
export default Pulsar;

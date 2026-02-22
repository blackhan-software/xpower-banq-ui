import { Button, Div } from "@/react/element";
import "./pulsar.scss";

type Props = Parameters<typeof Button>[0] & {
    pulse?: boolean;
};
export const Pulsar: React.FC<Props> = (
    props: Props
) => {
    const { class: clazz, children, pulse, ...rest } = props;
    const list = ["btn-pulsar", pulse ? "pulse" : ""];
    if (typeof clazz !== "string") {
        list.unshift(...clazz ?? []);
    } else {
        list.unshift(clazz);
    }
    return <Button class={list} {...rest}>
        {pulse ? <Spinners /> : children}
    </Button>;
};
function Spinners() {
    return <>
        <Div class="spinner-grow m-1" role="status" style={{
            animationDuration: "1s", animationDelay: "200ms",
            width: "0.50rem", height: "0.50rem",
        }} />
        <Div class="spinner-grow m-1" role="status" style={{
            animationDuration: "1s", animationDelay: "300ms",
            width: "0.50rem", height: "0.50rem",
        }} />
        <Div class="spinner-grow m-1" role="status" style={{
            animationDuration: "1s", animationDelay: "400ms",
            width: "0.50rem", height: "0.50rem",
        }} />
    </>;
}
Pulsar.displayName = "Pulsar";
export default Pulsar;

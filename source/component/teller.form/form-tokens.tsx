import { SVG } from "@/image";
import { A, Button, Li, Span, Ul } from "@/react/element";
import { usePoolTokens, useTellerToken } from "@/react/hook";
import { Token } from "@/type";
import { RWParams } from "@/url";

export function FormTokens() {
    const [tokens] = usePoolTokens();
    const [token, set_token] = useTellerToken();
    return <>
        <Button
            class={[
                "focus-ring", "focus-ring-secondary",
                "dropdown-toggle", "w-25",
                "btn", "btn-secondary",
            ]}
            data-bs-toggle="dropdown"
            aria-label="Select token"
            type="button"
        >
            <SVG icon={token.symbol} />
            <Span class="d-none d-sm-inline">
                &nbsp;{token.symbol}
            </Span>
        </Button>
        <Ul class="dropdown-menu dropdown-menu-end">
            {tokens?.map((token, i) => <Li key={i}>
                {entry([Token.from(token), set_token])}
            </Li>)}
        </Ul>
    </>;
}
function entry(
    [token, set_token]: ReturnType<typeof useTellerToken>,
) {
    return <A
        class="dropdown-item text-center"
        onClick={() => {
            RWParams.token = token;
            set_token(token);
        }}
        href="#"
    >
        <Span class="float-start">
            <SVG icon={token.symbol} />
        </Span>
        <Span>
            {token.symbol}
        </Span>
    </A>;
}
export default FormTokens;

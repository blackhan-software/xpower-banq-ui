import { Form } from "@/react/element";
import { useTellerMode } from "@/react/hook";
import { FormAmount } from "./form-amount";
import { FormTokens } from "./form-tokens";

export function TellerForm() {
    const [mode] = useTellerMode();
    return <Form name="teller"
        class="input-group"
        noValidate
    >
        <FormAmount mode={mode} />
        <FormTokens />
    </Form>;
}
export default TellerForm;

import { Div, I, Span } from "@/react/element";
import { Component, ReactNode } from "react";

type Props = {
    fallback?: ReactNode;
    children: ReactNode;
};
type State = {
    error: Error | null;
};
export class ErrorUi extends Component<Props, State> {
    static getDerivedStateFromError(error: Error): State {
        return { error };
    }
    override state: State = { error: null };
    override render() {
        if (this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return <Fallback
                error={this.state.error}
                onRetry={() => this.setState({ error: null })}
            />;
        }
        return this.props.children;
    }
}
function Fallback({ error, onRetry }: {
    error: Error;
    onRetry: () => void;
}) {
    return <Div class={[
        "alert alert-warning",
        "d-flex align-items-center",
        "justify-content-between",
        "m-2 p-2",
        "small",
    ]}>
        <Span>
            <I class="bi bi-exclamation-triangle-fill me-2" />
            <Span>{error.message || "Something went wrong"}</Span>
        </Span>
        <Span
            class="btn btn-sm btn-outline-warning ms-2"
            role="button"
            onClick={onRetry}
        >
            Retry
        </Span>
    </Div>;
}
export default ErrorUi;

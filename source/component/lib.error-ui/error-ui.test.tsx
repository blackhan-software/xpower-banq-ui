// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";

// Mock the element wrappers to pass through as native elements
vi.mock("@/react/element", () => ({
    Div: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
        (props, ref) => <div ref={ref} {...props} />,
    ),
    I: React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
        (props, ref) => <i ref={ref} {...props} />,
    ),
    Span: React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
        (props, ref) => <span ref={ref} {...props} />,
    ),
}));

import { ErrorUi } from "./error-ui";

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
    if (shouldThrow) {
        throw new Error("Test error message");
    }
    return <div data-testid="child">OK</div>;
}

describe("ErrorUi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Suppress React error boundary console.error
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
    });

    it("should render children when no error", () => {
        render(
            <ErrorUi>
                <div data-testid="child">Content</div>
            </ErrorUi>,
        );
        expect(screen.getByTestId("child")).toBeDefined();
        expect(screen.getByText("Content")).toBeDefined();
    });

    it("should render fallback when child throws", () => {
        render(
            <ErrorUi>
                <ThrowingChild shouldThrow={true} />
            </ErrorUi>,
        );
        // The default fallback should show the error message
        expect(screen.getByText("Test error message")).toBeDefined();
    });

    it("should show error.message in default fallback", () => {
        render(
            <ErrorUi>
                <ThrowingChild shouldThrow={true} />
            </ErrorUi>,
        );
        expect(screen.getByText("Test error message")).toBeDefined();
    });

    it("should show 'Something went wrong' for empty message", () => {
        function EmptyErrorChild(): never {
            throw new Error("");
        }
        render(
            <ErrorUi>
                <EmptyErrorChild />
            </ErrorUi>,
        );
        expect(screen.getByText("Something went wrong")).toBeDefined();
    });

    it("should show Retry button that clears error and re-renders children", () => {
        let shouldThrow = true;
        function ConditionalChild() {
            if (shouldThrow) {
                throw new Error("Boom");
            }
            return <div data-testid="recovered">Recovered</div>;
        }
        render(
            <ErrorUi>
                <ConditionalChild />
            </ErrorUi>,
        );
        // Should show error state
        expect(screen.getByText("Boom")).toBeDefined();
        const retryButton = screen.getByText("Retry");
        expect(retryButton).toBeDefined();
        // Fix the error condition and click Retry
        shouldThrow = false;
        fireEvent.click(retryButton);
        expect(screen.getByTestId("recovered")).toBeDefined();
    });

    it("should render custom fallback prop", () => {
        render(
            <ErrorUi fallback={<div data-testid="custom">Custom fallback</div>}>
                <ThrowingChild shouldThrow={true} />
            </ErrorUi>,
        );
        expect(screen.getByTestId("custom")).toBeDefined();
        expect(screen.getByText("Custom fallback")).toBeDefined();
    });
});

// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

const { el } = vi.hoisted(() => {
    const _React = require("react");
    return {
        el: (tag: string) => _React.forwardRef((props: any, ref: any) => {
            const { class: cls, "bs-html": _, ...rest } = props;
            if (cls !== undefined) {
                rest.className = Array.isArray(cls) ? cls.filter(Boolean).join(" ") : cls;
            }
            return _React.createElement(tag, { ref, ...rest });
        }),
    };
});

vi.mock("@/react/element", () => ({
    Span: el("span"),
}));

import { FadeIn } from "./fade-in";

describe("FadeIn", () => {
    afterEach(() => cleanup());

    it("should render children", () => {
        const { getByText } = render(<FadeIn>Hello</FadeIn>);
        expect(getByText("Hello")).toBeDefined();
    });

    it("should apply fade-in class", () => {
        const { container } = render(<FadeIn>Content</FadeIn>);
        const span = container.querySelector("span");
        expect(span?.className).toContain("fade-in");
    });

    it("should default to 200ms duration", () => {
        const { container } = render(<FadeIn>Content</FadeIn>);
        const span = container.querySelector("span");
        expect(span?.className).toContain("fade-in-200");
    });

    it("should accept 600ms duration", () => {
        const { container } = render(<FadeIn duration={600}>Content</FadeIn>);
        const span = container.querySelector("span");
        expect(span?.className).toContain("fade-in-600");
    });

    it("should apply visible class after mount", () => {
        const { container } = render(<FadeIn>Content</FadeIn>);
        const span = container.querySelector("span");
        expect(span?.className).toContain("visible");
    });
});

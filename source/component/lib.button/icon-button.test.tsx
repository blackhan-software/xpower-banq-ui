// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";

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
    Button: el("button"),
    I: el("i"),
}));
vi.mock("@/react/element/enhanced", () => ({
    Classic: {} as any,
}));

import { IconButton } from "./icon-button";

describe("IconButton", () => {
    afterEach(() => cleanup());

    it("should render a button", () => {
        const { container } = render(
            <IconButton icon="bi-play" aria-label="Play" />
        );
        expect(container.querySelector("button")).not.toBeNull();
    });

    it("should render icon element with correct class", () => {
        const { container } = render(
            <IconButton icon="bi-play" aria-label="Play" />
        );
        const icon = container.querySelector("i");
        expect(icon?.className).toContain("bi-play");
    });

    it("should show spinner when icon-spin is true", () => {
        const { container } = render(
            <IconButton icon="bi-play" icon-spin={true} aria-label="Loading" />
        );
        const icon = container.querySelector("i");
        expect(icon?.className).toContain("spinner-border");
    });

    it("should disable pointer events when spinning", () => {
        const { container } = render(
            <IconButton icon="bi-play" icon-spin={true} aria-label="Loading" />
        );
        const button = container.querySelector("button");
        expect(button?.style.pointerEvents).toBe("none");
    });

    it("should disable pointer events when disabled", () => {
        const { container } = render(
            <IconButton icon="bi-play" disabled aria-label="Disabled" />
        );
        const button = container.querySelector("button");
        expect(button?.style.pointerEvents).toBe("none");
    });

    it("should render children instead of icon when provided", () => {
        const { getByText } = render(
            <IconButton icon="bi-play">Custom</IconButton>
        );
        expect(getByText("Custom")).toBeDefined();
    });

    it("should toggle fill class on mouse enter/leave", () => {
        const { container } = render(
            <IconButton icon="bi-play" aria-label="Play" />
        );
        const button = container.querySelector("button")!;
        const icon = container.querySelector("i")!;
        fireEvent.mouseEnter(button);
        expect(icon.className).toContain("bi-play-fill");
        fireEvent.mouseLeave(button);
        expect(icon.className).not.toContain("bi-play-fill");
    });

    it("should toggle fill class on focus/blur", () => {
        const { container } = render(
            <IconButton icon="bi-play" aria-label="Play" />
        );
        const button = container.querySelector("button")!;
        const icon = container.querySelector("i")!;
        fireEvent.focus(button);
        expect(icon.className).toContain("bi-play-fill");
        fireEvent.blur(button);
        expect(icon.className).not.toContain("bi-play-fill");
    });

    it("should support custom icon-suffix", () => {
        const { container } = render(
            <IconButton icon="bi-caret-left" icon-suffix="-fill" aria-label="Prev" />
        );
        const button = container.querySelector("button")!;
        const icon = container.querySelector("i")!;
        fireEvent.mouseEnter(button);
        expect(icon.className).toContain("bi-caret-left-fill");
    });

    it("should accept a forwarded ref", () => {
        const ref = { current: null as HTMLButtonElement | null };
        render(
            <IconButton ref={ref} icon="bi-play" aria-label="Play" />
        );
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
});

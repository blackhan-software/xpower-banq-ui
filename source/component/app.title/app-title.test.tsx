// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

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
    H1: el("h1"),
    I: el("i"),
}));

import { AppTitle } from "./app-title";

describe("AppTitle", () => {
    afterEach(() => cleanup());

    it("should render the title text", () => {
        render(<AppTitle />);
        expect(screen.getByText(/XPower Banq/)).toBeDefined();
    });
    it("should render an h1 element", () => {
        render(<AppTitle />);
        const h1 = screen.getByRole("heading", { level: 1 });
        expect(h1).toBeDefined();
    });
    it("should include the bank icon", () => {
        render(<AppTitle />);
        const icon = document.querySelector("i.bi-bank");
        expect(icon).not.toBeNull();
    });
    it("should have title class", () => {
        render(<AppTitle />);
        const h1 = screen.getByRole("heading", { level: 1 });
        expect(h1.className).toContain("title");
    });
});

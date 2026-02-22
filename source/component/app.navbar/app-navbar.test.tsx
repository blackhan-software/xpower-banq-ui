// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
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
    A: el("a"),
    Div: el("div"),
    Span: el("span"),
}));
vi.mock("@/constant", () => ({
    WHITEPAPER_URL: "https://example.com/whitepaper.pdf",
}));
vi.mock("@/image", () => ({
    SVG: ({ icon }: { icon: string }) =>
        require("react").createElement("img", {
            "data-testid": `svg-${icon}`,
        }),
}));
vi.mock("./app-wallet", () => ({
    AppWallet: () =>
        require("react").createElement("div", { "data-testid": "app-wallet" }),
}));

import { AppNavbar } from "./app-navbar";

describe("AppNavbar", () => {
    beforeEach(() => vi.clearAllMocks());
    afterEach(() => cleanup());

    it("should render brand text", () => {
        render(<AppNavbar />);
        expect(screen.getByText(/XPower Banq/)).toBeDefined();
    });
    it("should render whitepaper link with correct href", () => {
        render(<AppNavbar />);
        const link = screen.getByText("Whitepaper");
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("https://example.com/whitepaper.pdf");
    });
    it("should open whitepaper in new tab", () => {
        render(<AppNavbar />);
        const link = screen.getByText("Whitepaper");
        expect(link.getAttribute("target")).toBe("_blank");
    });
    it("should render AppWallet component", () => {
        render(<AppNavbar />);
        expect(screen.getByTestId("app-wallet")).toBeDefined();
    });
    it("should render the BANQ SVG icon", () => {
        render(<AppNavbar />);
        expect(screen.getByTestId("svg-BANQ-fff")).toBeDefined();
    });
});

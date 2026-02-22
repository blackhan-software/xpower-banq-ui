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
    I: el("i"),
    Span: el("span"),
}));
vi.mock("@/app-version", () => ({
    appVersion: () => "1.0.0",
}));
vi.mock("@/blockchain", () => ({
    ChainId: { AVALANCHE_FUJI: 43113 },
}));
vi.mock("@/constant", () => ({
    WHITEPAPER_URL: "https://example.com/wp.pdf",
    DOCS_URL: "",
}));

const mockErrors = new Map<string, Error>();

vi.mock("@/react/hook", () => ({
    useErrors: () => [mockErrors, vi.fn()] as const,
    usePoolContract: () => [null] as const,
    usePositionContract: () => [null] as const,
    useTellerMode: () => ["supply"] as const,
    useTellerToken: () => [{ symbol: "APOW" }] as const,
    useVaultContract: () => [null] as const,
    useWalletChainId: () => [null] as const,
}));

vi.mock("@/zustand/service/action-guard", () => ({
    RETRY_REGISTRY: { retryAll: vi.fn() },
}));

vi.mock("./link", () => ({
    Link: ({ href, children }: any) =>
        require("react").createElement("a", { href }, children),
    MultiLink: ({ hrefs, children }: any) =>
        require("react").createElement("a", { href: hrefs?.[0] ?? "" }, children),
}));
vi.mock("./terms", () => ({
    TermsLink: () =>
        require("react").createElement("span", null, "Terms"),
}));

import { AppFooter } from "./app-footer";

describe("AppFooter", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockErrors.clear();
    });
    afterEach(() => cleanup());

    it("should render copyright year", () => {
        render(<AppFooter />);
        const year = new Date().getFullYear().toString();
        expect(screen.getByText(new RegExp(year))).toBeDefined();
    });

    it("should render version", () => {
        render(<AppFooter />);
        expect(screen.getByText(/v1\.0\.0-beta/)).toBeDefined();
    });

    it("should render terms link", () => {
        render(<AppFooter />);
        expect(screen.getByText("Terms")).toBeDefined();
    });

    it("should render social links", () => {
        const { container } = render(<AppFooter />);
        const links = container.querySelectorAll("a");
        // Should have links for Telegram, Twitter, Discord, whitepaper, avalanche
        expect(links.length).toBeGreaterThanOrEqual(4);
    });

    it("should render whitepaper link", () => {
        const { container } = render(<AppFooter />);
        const wpLink = container.querySelector('a[href="https://example.com/wp.pdf"]');
        expect(wpLink).not.toBeNull();
    });

    it("should render Avalanche link when no errors", () => {
        const { container } = render(<AppFooter />);
        const avalanche = container.querySelector("i.avalanche");
        expect(avalanche).not.toBeNull();
    });

    it("should render warning when errors exist", () => {
        mockErrors.set("test", new Error("fail"));
        render(<AppFooter />);
        // Warning emoji shown instead of avalanche icon
        expect(screen.getByRole("button") || screen.getByText(/⚠️/)).toBeDefined();
    });
});

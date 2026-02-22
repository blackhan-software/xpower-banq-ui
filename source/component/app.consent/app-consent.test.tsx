// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

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
    Button: el("button"),
    Div: el("div"),
    P: el("p"),
}));
vi.mock("../lib.fade-in", () => ({
    FadeIn: ({ children }: { children: any }) => children,
}));
vi.mock("./app-consent.scss", () => ({}));

import { AppConsent } from "./app-consent";

describe("AppConsent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });
    afterEach(() => cleanup());

    it("should render banner when not accepted", () => {
        render(<AppConsent />);
        expect(screen.getByText("Accept")).toBeDefined();
    });
    it("should show cookie consent text", () => {
        render(<AppConsent />);
        expect(screen.getByText("see consent")).toBeDefined();
    });
    it("should render consent link with correct href", () => {
        render(<AppConsent />);
        const link = screen.getByText("see consent");
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toContain("cookie-consent");
    });
    it("should open consent link in new tab", () => {
        render(<AppConsent />);
        const link = screen.getByText("see consent");
        expect(link.getAttribute("target")).toBe("_blank");
    });
    it("should hide banner and set localStorage on accept", () => {
        render(<AppConsent />);
        fireEvent.click(screen.getByText("Accept"));
        expect(localStorage.getItem("app-consent")).toBe("accepted");
        expect(screen.queryByText("Accept")).toBeNull();
    });
    it("should not render when already accepted", () => {
        localStorage.setItem("app-consent", "accepted");
        render(<AppConsent />);
        expect(screen.queryByText("Accept")).toBeNull();
    });
});

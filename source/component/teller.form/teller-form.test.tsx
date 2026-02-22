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
    Form: el("form"),
    Div: el("div"),
    Input: el("input"),
    Label: el("label"),
    Span: el("span"),
    Button: el("button"),
    A: el("a"),
    Li: el("li"),
    Ul: el("ul"),
}));

const hookMocks = vi.hoisted(() => ({
    useTellerMode: vi.fn().mockReturnValue(["supply", vi.fn()]),
}));

vi.mock("@/react/hook", () => ({
    useTellerMode: hookMocks.useTellerMode,
}));

vi.mock("./form-amount", () => ({
    FormAmount: ({ mode }: { mode: string }) =>
        require("react").createElement("div", { "data-testid": "form-amount" }, mode),
}));
vi.mock("./form-tokens", () => ({
    FormTokens: () =>
        require("react").createElement("div", { "data-testid": "form-tokens" }),
}));

import { TellerForm } from "./teller-form";

describe("TellerForm", () => {
    beforeEach(() => vi.clearAllMocks());
    afterEach(() => cleanup());

    it("should render a form element", () => {
        render(<TellerForm />);
        expect(document.querySelector("form")).not.toBeNull();
    });
    it("should set form name to 'teller'", () => {
        render(<TellerForm />);
        const form = document.querySelector("form");
        expect(form?.getAttribute("name")).toBe("teller");
    });
    it("should render FormAmount with current mode", () => {
        render(<TellerForm />);
        expect(screen.getByTestId("form-amount")).toBeDefined();
        expect(screen.getByText("supply")).toBeDefined();
    });
    it("should render FormAmount with borrow mode", () => {
        hookMocks.useTellerMode.mockReturnValue(["borrow", vi.fn()]);
        render(<TellerForm />);
        expect(screen.getByText("borrow")).toBeDefined();
    });
    it("should render FormTokens", () => {
        render(<TellerForm />);
        expect(screen.getByTestId("form-tokens")).toBeDefined();
    });
    it("should apply input-group class", () => {
        render(<TellerForm />);
        const form = document.querySelector("form");
        expect(form?.className).toBe("input-group");
    });
});

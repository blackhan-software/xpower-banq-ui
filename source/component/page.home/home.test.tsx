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
    Div: el("div"),
}));

const { component } = vi.hoisted(() => ({
    component: (name: string) => () =>
        require("react").createElement("div", { "data-testid": name }),
}));

vi.mock("@/component", () => ({
    ErrorUi: ({ children }: any) =>
        require("react").createElement("div", { "data-testid": "error-ui" }, children),
    MyPortfolio: component("my-portfolio"),
    TellerExec: component("teller-exec"),
    TellerForm: component("teller-form"),
    TellerMode: component("teller-mode"),
    TellerPool: component("teller-pool"),
    TellerRange: component("teller-range"),
}));

import { Home } from "./home";

describe("Home", () => {
    afterEach(() => cleanup());

    it("should render the home page container", () => {
        const { container } = render(<Home />);
        const div = container.querySelector(".home-page");
        expect(div).not.toBeNull();
    });

    it("should render TellerPool", () => {
        const { getByTestId } = render(<Home />);
        expect(getByTestId("teller-pool")).toBeDefined();
    });

    it("should render TellerMode", () => {
        const { getByTestId } = render(<Home />);
        expect(getByTestId("teller-mode")).toBeDefined();
    });

    it("should render TellerForm", () => {
        const { getByTestId } = render(<Home />);
        expect(getByTestId("teller-form")).toBeDefined();
    });

    it("should render TellerRange", () => {
        const { getByTestId } = render(<Home />);
        expect(getByTestId("teller-range")).toBeDefined();
    });

    it("should render TellerExec", () => {
        const { getByTestId } = render(<Home />);
        expect(getByTestId("teller-exec")).toBeDefined();
    });

    it("should render MyPortfolio inside ErrorUi", () => {
        const { getByTestId } = render(<Home />);
        expect(getByTestId("error-ui")).toBeDefined();
        expect(getByTestId("my-portfolio")).toBeDefined();
    });
});

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
    Div: el("div"),
    Span: el("span"),
}));

const hookMocks = vi.hoisted(() => ({
    usePool: vi.fn().mockReturnValue([300n, vi.fn()]),
    useTellerFlag: vi.fn().mockReturnValue([true, vi.fn()]),
    useTellerMode: vi.fn().mockReturnValue(["supply", vi.fn()]),
    usePoolTokens: vi.fn().mockReturnValue([["0xTOKEN_A"], vi.fn()]),
    usePoolRateInfos: vi.fn().mockReturnValue([new Map(), vi.fn()]),
    usePoolRateModels: vi.fn().mockReturnValue([new Map(), vi.fn()]),
    usePoolLockParams: vi.fn().mockReturnValue([new Map(), vi.fn()]),
    usePortfolio: vi.fn().mockReturnValue([null, vi.fn()]),
    usePortfolioHealth: vi.fn().mockReturnValue([null, vi.fn()]),
    usePortfolioYield: vi.fn().mockReturnValue([null, vi.fn()]),
}));

vi.mock("@/react/hook", () => ({
    usePool: hookMocks.usePool,
    useTellerFlag: hookMocks.useTellerFlag,
    useTellerMode: hookMocks.useTellerMode,
    usePoolTokens: hookMocks.usePoolTokens,
    usePoolRateInfos: hookMocks.usePoolRateInfos,
    usePoolRateModels: hookMocks.usePoolRateModels,
    usePoolLockParams: hookMocks.usePoolLockParams,
    usePortfolio: hookMocks.usePortfolio,
    usePortfolioHealth: hookMocks.usePortfolioHealth,
    usePortfolioYield: hookMocks.usePortfolioYield,
}));

vi.mock("./portfolio-head", () => ({
    PortfolioHead: ({ mode }: { mode: string }) =>
        require("react").createElement("div", { "data-testid": "portfolio-head" }, mode),
}));
vi.mock("./portfolio-body", () => ({
    PortfolioBody: ({ mode }: { mode: string }) =>
        require("react").createElement("div", { "data-testid": "portfolio-body" }, mode),
}));

import { MyPortfolio } from "./my-portfolio";

describe("MyPortfolio", () => {
    beforeEach(() => vi.clearAllMocks());
    afterEach(() => cleanup());

    it("should render when show is true", () => {
        render(<MyPortfolio />);
        const el = document.getElementById("my-portfolio");
        expect(el).not.toBeNull();
        expect(el?.className).not.toContain("d-none");
    });
    it("should apply d-none class when show is false", () => {
        hookMocks.useTellerFlag.mockReturnValue([false, vi.fn()]);
        render(<MyPortfolio />);
        const el = document.getElementById("my-portfolio");
        expect(el?.className).toContain("d-none");
    });
    it("should render PortfolioHead", () => {
        render(<MyPortfolio />);
        expect(screen.getByTestId("portfolio-head")).toBeDefined();
    });
    it("should render PortfolioBody", () => {
        render(<MyPortfolio />);
        expect(screen.getByTestId("portfolio-body")).toBeDefined();
    });
    it("should pass supply mode to children", () => {
        render(<MyPortfolio />);
        expect(screen.getByTestId("portfolio-head").textContent).toBe("supply");
        expect(screen.getByTestId("portfolio-body").textContent).toBe("supply");
    });
    it("should pass borrow mode to children", () => {
        hookMocks.useTellerMode.mockReturnValue(["borrow", vi.fn()]);
        render(<MyPortfolio />);
        expect(screen.getByTestId("portfolio-head").textContent).toBe("borrow");
        expect(screen.getByTestId("portfolio-body").textContent).toBe("borrow");
    });
    it("should pass portfolio mode to usePortfolio", () => {
        hookMocks.useTellerMode.mockReturnValue(["borrow", vi.fn()]);
        render(<MyPortfolio />);
        expect(hookMocks.usePortfolio).toHaveBeenCalledWith("borrow");
    });
});

// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";


const { el, CONTRACT_RUN } = vi.hoisted(() => {
    const _React = require("react");
    return {
        CONTRACT_RUN: { value: "v10a" },
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
vi.mock("@/constant", () => ({
    get CONTRACT_RUN() { return CONTRACT_RUN.value; },
}));
vi.mock("@/function", () => ({
    v: (s: string) => {
        const m = s.match(/v?(\d+)([a-z]?)/);
        if (!m) return 0;
        return Number(m[1]) * 100 + (m[2] ? m[2].charCodeAt(0) - 96 : 0);
    },
}));

vi.mock("@/component/lib.error-ui", () => ({
    ErrorUi: ({ children }: any) =>
        require("react").createElement("div", { "data-testid": "error-ui" }, children),
}));
vi.mock("./position-charts", () => ({
    PositionCharts: () =>
        require("react").createElement("div", { "data-testid": "position-charts" }),
}));
vi.mock("./position-toggle", () => ({
    PositionToggle: () =>
        require("react").createElement("div", { "data-testid": "position-toggle" }),
}));
vi.mock("./position-label", () => ({
    PositionLabel: () =>
        require("react").createElement("div", { "data-testid": "position-label" }),
}));
vi.mock("./position-amount", () => ({
    PositionAmount: () =>
        require("react").createElement("div", { "data-testid": "position-amount" }),
}));
vi.mock("./position-rate", () => ({
    PositionRate: () =>
        require("react").createElement("div", { "data-testid": "position-rate" }),
}));
vi.mock("./position-lock", () => ({
    PositionLock: () =>
        require("react").createElement("div", { "data-testid": "position-lock" }),
}));
vi.mock("./position-handle", () => ({
    PositionHandle: () =>
        require("react").createElement("div", { "data-testid": "position-handle" }),
}));

vi.mock("@/type", () => ({
    PoolToken: { from: (pool: bigint, token: string) => `${pool}:${token}` },
    PoolList: { indexOf: () => 0 },
    Position: { from: (addr: string) => ({
        address: addr, amount: 0n, cap: 0n, capTotal: 0n,
        locked: 0n, lockedTotal: 0n, supply: 0n,
    })},
    RateInfo: { init: () => ({}) },
    RateModel: { init: () => ({}) },
    LockParams: { init: () => ({}) },
    Mode: { supply: "supply", borrow: "borrow" },
}));

import { PortfolioBody } from "./portfolio-body";
import { Mode } from "@/type";

describe("PortfolioBody", () => {
    beforeEach(() => vi.clearAllMocks());
    afterEach(() => cleanup());

    it("should render portfolio-body container", () => {
        render(<PortfolioBody
            tokens={[]} portfolio={null}
            model_map={new Map()} rate_map={new Map()}
            lock_params_map={new Map()} mode={Mode.supply} pool={300n}
        />);
        expect(document.getElementById("portfolio-body")).not.toBeNull();
    });
    it("should render nothing when tokens is null", () => {
        render(<PortfolioBody
            tokens={null} portfolio={null}
            model_map={new Map()} rate_map={new Map()}
            lock_params_map={new Map()} mode={Mode.supply} pool={300n}
        />);
        expect(document.querySelectorAll(".accordion-item").length).toBe(0);
    });
    it("should render an accordion item per token", () => {
        render(<PortfolioBody
            tokens={["0xA", "0xB"]} portfolio={null}
            model_map={new Map()} rate_map={new Map()}
            lock_params_map={new Map()} mode={Mode.supply} pool={300n}
        />);
        expect(document.querySelectorAll(".accordion-item").length).toBe(2);
    });
    it("should render position sub-components per token", () => {
        render(<PortfolioBody
            tokens={["0xA"]} portfolio={null}
            model_map={new Map()} rate_map={new Map()}
            lock_params_map={new Map()} mode={Mode.supply} pool={300n}
        />);
        expect(screen.getByTestId("position-toggle")).toBeDefined();
        expect(screen.getByTestId("position-label")).toBeDefined();
        expect(screen.getByTestId("position-amount")).toBeDefined();
        expect(screen.getByTestId("position-rate")).toBeDefined();
        expect(screen.getByTestId("position-handle")).toBeDefined();
    });
    it("should render @ sign and lock button", () => {
        render(<PortfolioBody
            tokens={["0xA"]} portfolio={null}
            model_map={new Map()} rate_map={new Map()}
            lock_params_map={new Map()} mode={Mode.supply} pool={300n}
        />);
        expect(screen.getByText("@")).toBeDefined();
        expect(screen.getByTestId("position-lock")).toBeDefined();
    });
    it("should wrap charts in ErrorUi", () => {
        render(<PortfolioBody
            tokens={["0xA"]} portfolio={null}
            model_map={new Map()} rate_map={new Map()}
            lock_params_map={new Map()} mode={Mode.supply} pool={300n}
        />);
        expect(screen.getByTestId("error-ui")).toBeDefined();
        expect(screen.getByTestId("position-charts")).toBeDefined();
    });
    it("should render accordion-body for each token", () => {
        render(<PortfolioBody
            tokens={["0xA", "0xB"]} portfolio={null}
            model_map={new Map()} rate_map={new Map()}
            lock_params_map={new Map()} mode={Mode.supply} pool={300n}
        />);
        expect(document.getElementById("accordion-body-0")).not.toBeNull();
        expect(document.getElementById("accordion-body-1")).not.toBeNull();
    });
});

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
    I: el("i"),
    Span: el("span"),
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);
vi.mock("@/type", () => ({
    Health: {
        ratio: (h: { supply: bigint; borrow: bigint }) => {
            if (h.borrow === 0n) return Infinity;
            return Number(h.supply) / Number(h.borrow);
        },
    },
    Mode: { supply: "supply", borrow: "borrow" },
}));

import { PortfolioHead } from "./portfolio-head";

describe("PortfolioHead", () => {
    beforeEach(() => vi.clearAllMocks());
    afterEach(() => cleanup());

    it("should render 'Supply Positions' when mode is supply", () => {
        render(<PortfolioHead health={null} apy={null} mode={"supply" as any} />);
        expect(screen.getByText("Supply Positions")).toBeDefined();
    });
    it("should render 'Borrow Positions' when mode is borrow", () => {
        render(<PortfolioHead health={null} apy={null} mode={"borrow" as any} />);
        expect(screen.getByText("Borrow Positions")).toBeDefined();
    });
    it("should render heart-pulse-fill icon when ratio > 1.5", () => {
        const health = { supply: 200n, borrow: 100n }; // ratio = 2.0
        render(<PortfolioHead health={health as any} apy={null} mode={"supply" as any} />);
        expect(document.querySelector(".bi-heart-pulse-fill")).not.toBeNull();
    });
    it("should render heartbreak-fill icon when 1.0 < ratio <= 1.5", () => {
        const health = { supply: 120n, borrow: 100n }; // ratio = 1.2
        render(<PortfolioHead health={health as any} apy={null} mode={"supply" as any} />);
        expect(document.querySelector(".bi-heartbreak-fill")).not.toBeNull();
    });
    it("should render heart icon when ratio <= 1.0", () => {
        const health = { supply: 80n, borrow: 100n }; // ratio = 0.8
        render(<PortfolioHead health={health as any} apy={null} mode={"supply" as any} />);
        expect(document.querySelector(".bi-heart")).not.toBeNull();
    });
    it("should show Healthy title when ratio > 1.5", () => {
        const health = { supply: 200n, borrow: 100n };
        render(<PortfolioHead health={health as any} apy={null} mode={"supply" as any} />);
        const el = document.querySelector("[title*='Healthy']");
        expect(el).not.toBeNull();
    });
    it("should show At Risk title when 1.0 < ratio <= 1.5", () => {
        const health = { supply: 120n, borrow: 100n };
        render(<PortfolioHead health={health as any} apy={null} mode={"supply" as any} />);
        const el = document.querySelector("[title*='At Risk']");
        expect(el).not.toBeNull();
    });
    it("should show R.I.P. title when 0 < ratio <= 1.0", () => {
        const health = { supply: 80n, borrow: 100n };
        render(<PortfolioHead health={health as any} apy={null} mode={"supply" as any} />);
        const el = document.querySelector("[title*='R.I.P.']");
        expect(el).not.toBeNull();
    });
    it("should render heart-pulse-fill when health is null", () => {
        render(<PortfolioHead health={null} apy={null} mode={"supply" as any} />);
        expect(document.querySelector(".bi-heart-pulse-fill")).not.toBeNull();
    });
    it("should set aria-live on health element", () => {
        render(<PortfolioHead health={null} apy={null} mode={"supply" as any} />);
        const el = document.querySelector("[aria-live='polite']");
        expect(el).not.toBeNull();
    });
    it("should render caret-up icon when APY is positive", () => {
        render(<PortfolioHead health={null} apy={0.05} mode={"supply" as any} />);
        expect(document.querySelector(".bi-caret-up-square-fill")).not.toBeNull();
    });
    it("should render caret-down icon when APY is negative", () => {
        render(<PortfolioHead health={null} apy={-0.05} mode={"supply" as any} />);
        expect(document.querySelector(".bi-caret-down-square-fill")).not.toBeNull();
    });
    it("should render caret-up icon when APY is zero", () => {
        render(<PortfolioHead health={null} apy={0} mode={"supply" as any} />);
        expect(document.querySelector(".bi-caret-up-square-fill")).not.toBeNull();
    });
    it("should render caret-up icon when APY is null", () => {
        render(<PortfolioHead health={null} apy={null} mode={"supply" as any} />);
        expect(document.querySelector(".bi-caret-up-square-fill")).not.toBeNull();
    });
    it("should show Portfolio APY title", () => {
        render(<PortfolioHead health={null} apy={0.05} mode={"supply" as any} />);
        const el = document.querySelector("[title*='Portfolio APY']");
        expect(el).not.toBeNull();
    });
    it("should show positive APY direction in title", () => {
        render(<PortfolioHead health={null} apy={0.05} mode={"supply" as any} />);
        const el = document.querySelector("[title*='Positive']");
        expect(el).not.toBeNull();
    });
});

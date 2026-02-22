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
    Datalist: el("datalist"),
    Div: el("div"),
    Input: el("input"),
    Option: el("option"),
}));

vi.mock("@/component/lib.button", () => {
    const _React = require("react");
    return {
        IconButton: _React.forwardRef(({
            icon, title, class: cls,
            "icon-spin": _, "icon-suffix": _s, ...rest
        }: any, ref: any) =>
            _React.createElement("button", {
                ref, "data-testid": `icon-${icon}`, title,
                className: Array.isArray(cls) ? cls.join(" ") : cls,
                ...rest,
            })
        ),
    };
});

const hookMocks = vi.hoisted(() => ({
    usePool: vi.fn().mockReturnValue([100n, vi.fn()]),
}));

vi.mock("@/react/hook", () => ({
    usePool: hookMocks.usePool,
}));
vi.mock("../../react/hook/use-key-up", () => ({
    useKeyUp: vi.fn(),
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal, {
        buffered: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
    })
);
vi.mock("@/type", () => ({
    Pool: {
        name: (p: bigint) => `Pool-${p}`,
        from: (name: string) => {
            const m = name.match(/^Pool-(\d+)$/);
            return m?.[1] ? BigInt(m[1]) : null;
        },
    },
    PoolList: {
        query: () => [
            { pool: 100n },
            { pool: 200n },
            { pool: 300n },
        ],
        next: (pool: bigint) => pool === 300n ? null : pool + 100n,
        prev: (pool: bigint) => pool === 100n ? null : pool - 100n,
    },
}));

import { TellerPool, ListPool } from "./teller-pool";

describe("TellerPool", () => {
    beforeEach(() => vi.clearAllMocks());
    afterEach(() => cleanup());

    it("should render a btn-group", () => {
        render(<TellerPool />);
        const group = document.querySelector("[role='group']");
        expect(group).not.toBeNull();
        expect(group?.className).toContain("btn-group");
    });
    it("should render prev and next buttons", () => {
        render(<TellerPool />);
        expect(screen.getByTestId("icon-bi-caret-left")).toBeDefined();
        expect(screen.getByTestId("icon-bi-caret-right")).toBeDefined();
    });
    it("should set aria-label on prev button", () => {
        render(<TellerPool />);
        const prev = screen.getByTestId("icon-bi-caret-left");
        expect(prev.getAttribute("aria-label")).toBe("Previous pool");
    });
    it("should set aria-label on next button", () => {
        render(<TellerPool />);
        const next = screen.getByTestId("icon-bi-caret-right");
        expect(next.getAttribute("aria-label")).toBe("Next pool");
    });
    it("should set title on prev button", () => {
        render(<TellerPool />);
        const prev = screen.getByTestId("icon-bi-caret-left");
        expect(prev.getAttribute("title")).toContain("Previous Pool");
    });
    it("should set title on next button", () => {
        render(<TellerPool />);
        const next = screen.getByTestId("icon-bi-caret-right");
        expect(next.getAttribute("title")).toContain("Next Pool");
    });
    it("should call set_pool on prev click", () => {
        const set_pool = vi.fn();
        hookMocks.usePool.mockReturnValue([200n, set_pool]);
        render(<TellerPool />);
        fireEvent.click(screen.getByTestId("icon-bi-caret-left"));
        expect(set_pool).toHaveBeenCalledWith(100n);
    });
    it("should call set_pool on next click", () => {
        const set_pool = vi.fn();
        hookMocks.usePool.mockReturnValue([200n, set_pool]);
        render(<TellerPool />);
        fireEvent.click(screen.getByTestId("icon-bi-caret-right"));
        expect(set_pool).toHaveBeenCalledWith(300n);
    });
    it("should not call set_pool when prev returns null", () => {
        const set_pool = vi.fn();
        hookMocks.usePool.mockReturnValue([100n, set_pool]);
        render(<TellerPool />);
        fireEvent.click(screen.getByTestId("icon-bi-caret-left"));
        expect(set_pool).not.toHaveBeenCalled();
    });
    it("should not call set_pool when next returns null", () => {
        const set_pool = vi.fn();
        hookMocks.usePool.mockReturnValue([300n, set_pool]);
        render(<TellerPool />);
        fireEvent.click(screen.getByTestId("icon-bi-caret-right"));
        expect(set_pool).not.toHaveBeenCalled();
    });
});

describe("ListPool", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        hookMocks.usePool.mockReturnValue([100n, vi.fn()]);
    });
    afterEach(() => cleanup());

    it("should render an input with pool name", () => {
        render(<ListPool />);
        const input = document.querySelector("input") as HTMLInputElement;
        expect(input).not.toBeNull();
        expect(input.defaultValue).toBe("Pool-100");
    });
    it("should render datalist options", () => {
        render(<ListPool />);
        const options = document.querySelectorAll("option");
        expect(options.length).toBe(3);
    });
    it("should set aria-label on input", () => {
        render(<ListPool />);
        const input = document.querySelector("input");
        expect(input?.getAttribute("aria-label")).toBe("Select pool");
    });
    it("should call set_pool on valid input change", () => {
        const set_pool = vi.fn();
        hookMocks.usePool.mockReturnValue([100n, set_pool]);
        render(<ListPool />);
        const input = document.querySelector("input") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "Pool-200" } });
        expect(set_pool).toHaveBeenCalledWith(200n);
    });
    it("should not call set_pool on invalid input change", () => {
        const set_pool = vi.fn();
        hookMocks.usePool.mockReturnValue([100n, set_pool]);
        render(<ListPool />);
        const input = document.querySelector("input") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "invalid" } });
        expect(set_pool).not.toHaveBeenCalled();
    });
    it("should not call set_pool when selecting same pool", () => {
        const set_pool = vi.fn();
        hookMocks.usePool.mockReturnValue([100n, set_pool]);
        render(<ListPool />);
        const input = document.querySelector("input") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "Pool-100" } });
        expect(set_pool).not.toHaveBeenCalled();
    });
});

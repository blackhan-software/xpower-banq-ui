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
    Button: el("button"),
    Div: el("div"),
    I: el("i"),
}));

const hookMocks = vi.hoisted(() => ({
    useTellerMode: vi.fn().mockReturnValue(["supply", vi.fn()]),
}));

vi.mock("@/react/hook", () => ({
    useTellerMode: hookMocks.useTellerMode,
}));
vi.mock("@/type/mode", () => ({
    Mode: { supply: "supply", borrow: "borrow" },
}));

const urlMock = vi.hoisted(() => ({
    RWParams: { mode: "supply" as string },
}));
vi.mock("@/url", () => urlMock);

import { TellerMode } from "./teller-mode";

describe("TellerMode", () => {
    beforeEach(() => vi.clearAllMocks());
    afterEach(() => cleanup());

    it("should render a btn-group", () => {
        render(<TellerMode />);
        const group = document.querySelector("[role='group']");
        expect(group).not.toBeNull();
        expect(group?.className).toContain("btn-group");
    });
    it("should render two buttons", () => {
        render(<TellerMode />);
        const buttons = document.querySelectorAll("button");
        expect(buttons.length).toBe(2);
    });
    it("should render Supply text", () => {
        render(<TellerMode />);
        expect(screen.getByText("Supply")).toBeDefined();
    });
    it("should render Borrow text", () => {
        render(<TellerMode />);
        expect(screen.getByText("Borrow")).toBeDefined();
    });
    it("should apply btn-secondary to active supply button", () => {
        render(<TellerMode />);
        const supply = screen.getByText("Supply");
        expect(supply.className).toContain("btn-secondary");
        expect(supply.className).not.toContain("btn-outline-secondary");
    });
    it("should apply btn-outline-secondary to inactive borrow button", () => {
        render(<TellerMode />);
        const borrow = screen.getByText("Borrow");
        expect(borrow.className).toContain("btn-outline-secondary");
    });
    it("should call set_mode with borrow on borrow click", () => {
        const set_mode = vi.fn();
        hookMocks.useTellerMode.mockReturnValue(["supply", set_mode]);
        render(<TellerMode />);
        fireEvent.click(screen.getByText("Borrow"));
        expect(set_mode).toHaveBeenCalledWith("borrow");
    });
    it("should update RWParams.mode on click", () => {
        urlMock.RWParams.mode = "supply";
        const set_mode = vi.fn();
        hookMocks.useTellerMode.mockReturnValue(["supply", set_mode]);
        render(<TellerMode />);
        fireEvent.click(screen.getByText("Borrow"));
        expect(urlMock.RWParams.mode).toBe("borrow");
    });
    it("should toggle classes when mode is borrow", () => {
        hookMocks.useTellerMode.mockReturnValue(["borrow", vi.fn()]);
        render(<TellerMode />);
        const supply = screen.getByText("Supply");
        const borrow = screen.getByText("Borrow");
        expect(supply.className).toContain("btn-outline-secondary");
        expect(borrow.className).toContain("btn-secondary");
        expect(borrow.className).not.toContain("btn-outline-secondary");
    });
    it("should render piggy-bank icon with fill when supply inactive", () => {
        hookMocks.useTellerMode.mockReturnValue(["borrow", vi.fn()]);
        render(<TellerMode />);
        const icon = document.querySelector(".bi-piggy-bank-fill");
        expect(icon).not.toBeNull();
    });
    it("should render credit-card icon with fill when borrow inactive", () => {
        hookMocks.useTellerMode.mockReturnValue(["supply", vi.fn()]);
        render(<TellerMode />);
        const icon = document.querySelector(".bi-credit-card-fill");
        expect(icon).not.toBeNull();
    });
});

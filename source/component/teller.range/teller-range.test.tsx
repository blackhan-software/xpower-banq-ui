// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";

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
    Input: el("input"),
    Span: el("span"),
}));

const hookMocks = vi.hoisted(() => ({
    useTellerMode: vi.fn().mockReturnValue(["supply", vi.fn()]),
    useTellerPercent: vi.fn().mockReturnValue([50, vi.fn()]),
}));

vi.mock("@/react/hook", () => ({
    useTellerMode: hookMocks.useTellerMode,
    useTellerPercent: hookMocks.useTellerPercent,
}));

import { TellerRange } from "./teller-range";

describe("TellerRange", () => {
    beforeEach(() => vi.clearAllMocks());
    afterEach(() => cleanup());

    it("should render a range input", () => {
        render(<TellerRange />);
        const input = document.querySelector("input[type='range']");
        expect(input).not.toBeNull();
    });
    it("should set min=0, max=100, step=1", () => {
        render(<TellerRange />);
        const input = document.querySelector("input[type='range']") as HTMLInputElement;
        expect(input.min).toBe("0");
        expect(input.max).toBe("100");
        expect(input.step).toBe("1");
    });
    it("should set value from useTellerPercent", () => {
        hookMocks.useTellerPercent.mockReturnValue([75, vi.fn()]);
        render(<TellerRange />);
        const input = document.querySelector("input[type='range']") as HTMLInputElement;
        expect(input.value).toBe("75");
    });
    it("should default to 0 when percent is null", () => {
        hookMocks.useTellerPercent.mockReturnValue([null, vi.fn()]);
        render(<TellerRange />);
        const input = document.querySelector("input[type='range']") as HTMLInputElement;
        expect(input.value).toBe("0");
    });
    it("should call set_percent on change", () => {
        const set_percent = vi.fn();
        hookMocks.useTellerPercent.mockReturnValue([50, set_percent]);
        render(<TellerRange />);
        const input = document.querySelector("input[type='range']") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "75" } });
        expect(set_percent).toHaveBeenCalledWith(75);
    });
    it("should not call set_percent when value unchanged", () => {
        const set_percent = vi.fn();
        hookMocks.useTellerPercent.mockReturnValue([50, set_percent]);
        render(<TellerRange />);
        const input = document.querySelector("input[type='range']") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "50" } });
        expect(set_percent).not.toHaveBeenCalled();
    });
    it("should render tick marks", () => {
        render(<TellerRange />);
        const ticks = document.querySelectorAll(".tick");
        expect(ticks.length).toBe(3);
    });
    it("should pass current mode to useTellerPercent", () => {
        hookMocks.useTellerMode.mockReturnValue(["borrow", vi.fn()]);
        render(<TellerRange />);
        expect(hookMocks.useTellerPercent).toHaveBeenCalledWith("borrow");
    });
});

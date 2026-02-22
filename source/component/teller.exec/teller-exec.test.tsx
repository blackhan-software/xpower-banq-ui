// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const { el } = vi.hoisted(() => {
    const _React = require("react");
    return {
        el: (tag: string) => _React.forwardRef((props: any, ref: any) => {
            const { class: cls, "bs-html": _, pulse: _p, ...rest } = props;
            if (cls !== undefined) {
                rest.className = Array.isArray(cls) ? cls.filter(Boolean).join(" ") : cls;
            }
            return _React.createElement(tag, { ref, ...rest });
        }),
    };
});

vi.mock("@/react/element", () => {
    const _React = require("react");
    return {
        Div: el("div"),
        Span: el("span"),
        Button: el("button"),
        Pulsar: ({ children, pulse, class: _cls, ...rest }: any) =>
            _React.createElement("button", {
                "data-testid": "pulsar", "data-pulse": String(pulse), ...rest
            }, children),
    };
});

vi.mock("@/component/lib.button", () => {
    const _React = require("react");
    return {
        IconButton: _React.forwardRef(({
            icon, title, class: cls,
            "icon-spin": _, "icon-suffix": _s, "bs-html": _b, ...rest
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
    usePool: vi.fn().mockReturnValue([300n, vi.fn()]),
    useTellerMode: vi.fn().mockReturnValue(["supply", vi.fn()]),
    useTellerToken: vi.fn().mockReturnValue([
        { address: "0xTOKEN", decimals: 18, supply: 0n, symbol: "XPOW" },
        vi.fn(),
    ]),
    useTellerAmount: vi.fn().mockReturnValue([100, vi.fn()]),
    useTellerFlag: vi.fn().mockReturnValue([true, vi.fn()]),
    useWalletConnect: vi.fn().mockReturnValue([3, vi.fn()]),
    useWalletAccount: vi.fn().mockReturnValue([1n, vi.fn()]),
    useTimeout: vi.fn(),
}));

vi.mock("@/react/hook", () => ({
    usePool: hookMocks.usePool,
    useTellerMode: hookMocks.useTellerMode,
    useTellerToken: hookMocks.useTellerToken,
    useTellerAmount: hookMocks.useTellerAmount,
    useTellerFlag: hookMocks.useTellerFlag,
    useWalletConnect: hookMocks.useWalletConnect,
    useWalletAccount: hookMocks.useWalletAccount,
    useTimeout: hookMocks.useTimeout,
}));

vi.mock("@/blockchain", () => ({
    Status: {
        NoProvider: 0, WrongNetwork: 1, NoAccounts: 2, Ready: 3,
        label: (s: number | null) => {
            switch (s) {
                case 1: return "Switch Network";
                case 2: return "Connect Wallet";
                case 3: return "Accounts Ready";
                default: return "Install Wallet";
            }
        },
    },
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal, {
        buffered: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
    })
);
vi.mock("@/type", () => ({
    Mode: { supply: "supply", borrow: "borrow" },
    Token: {},
}));
vi.mock("@/url", () => ({
    RWParams: { portfolio: true },
}));
vi.mock("./tx-runner", () => ({
    TxRunner: vi.fn().mockResolvedValue(undefined),
}));

import { TellerExec } from "./teller-exec";

describe("TellerExec", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        hookMocks.usePool.mockReturnValue([300n, vi.fn()]);
        hookMocks.useTellerMode.mockReturnValue(["supply", vi.fn()]);
        hookMocks.useTellerToken.mockReturnValue([
            { address: "0xTOKEN", decimals: 18, supply: 0n, symbol: "XPOW" },
            vi.fn(),
        ]);
        hookMocks.useTellerAmount.mockReturnValue([100, vi.fn()]);
        hookMocks.useTellerFlag.mockReturnValue([true, vi.fn()]);
        hookMocks.useWalletConnect.mockReturnValue([3, vi.fn()]);
        hookMocks.useWalletAccount.mockReturnValue([1n, vi.fn()]);
    });
    afterEach(() => cleanup());

    it("should render the pulsar button", () => {
        render(<TellerExec />);
        expect(screen.getByTestId("pulsar")).toBeDefined();
    });
    it("should show 'Supply XPOW' when wallet is ready", () => {
        render(<TellerExec />);
        expect(screen.getByText("Supply XPOW")).toBeDefined();
    });
    it("should show 'Borrow APOW' when mode is borrow", () => {
        hookMocks.useTellerMode.mockReturnValue(["borrow", vi.fn()]);
        hookMocks.useTellerToken.mockReturnValue([
            { address: "0xAPOW", decimals: 18, supply: 0n, symbol: "APOW" },
            vi.fn(),
        ]);
        render(<TellerExec />);
        expect(screen.getByText("Borrow APOW")).toBeDefined();
    });
    it("should show 'Install Wallet' when no provider", () => {
        hookMocks.useWalletConnect.mockReturnValue([0, vi.fn()]);
        render(<TellerExec />);
        expect(screen.getByText("Install Wallet")).toBeDefined();
    });
    it("should show 'Connect Wallet' when no accounts", () => {
        hookMocks.useWalletConnect.mockReturnValue([2, vi.fn()]);
        render(<TellerExec />);
        expect(screen.getByText("Connect Wallet")).toBeDefined();
    });
    it("should show 'Switch Network' when wrong network", () => {
        hookMocks.useWalletConnect.mockReturnValue([1, vi.fn()]);
        render(<TellerExec />);
        expect(screen.getByText("Switch Network")).toBeDefined();
    });
    it("should render the portfolio toggle button", () => {
        render(<TellerExec />);
        expect(screen.getByTestId("icon-bi-hdd-rack")).toBeDefined();
    });
    it("should render toggle with 'Hide Portfolio' when shown", () => {
        hookMocks.useTellerFlag.mockReturnValue([true, vi.fn()]);
        render(<TellerExec />);
        expect(screen.getByTitle("Hide Portfolio")).toBeDefined();
    });
    it("should render toggle with 'Show Portfolio' when hidden", () => {
        hookMocks.useTellerFlag.mockReturnValue([false, vi.fn()]);
        render(<TellerExec />);
        expect(screen.getByTitle("Show Portfolio")).toBeDefined();
    });
    it("should render the info button", () => {
        render(<TellerExec />);
        expect(screen.getByTestId("icon-bi-info-circle")).toBeDefined();
    });
    it("should show supply info title when supply mode", () => {
        render(<TellerExec />);
        const info = screen.getByTestId("icon-bi-info-circle");
        expect(info.getAttribute("title")).toContain("approval");
    });
    it("should show borrow info title when borrow mode", () => {
        hookMocks.useTellerMode.mockReturnValue(["borrow", vi.fn()]);
        render(<TellerExec />);
        const info = screen.getByTestId("icon-bi-info-circle");
        expect(info.getAttribute("title")).toContain("collateral");
    });
});

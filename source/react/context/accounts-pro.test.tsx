// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act, screen } from "@testing-library/react";
import { useContext } from "react";

const mocks = vi.hoisted(() => {
    const listeners: Record<string, Function[]> = {};
    const ethObj = {
        on: vi.fn((event: string, fn: Function) => {
            (listeners[event] ??= []).push(fn);
        }),
        off: vi.fn((event: string, fn: Function) => {
            if (listeners[event]) {
                listeners[event] = listeners[event].filter(f => f !== fn);
            }
        }),
    };
    return {
        ethObj, listeners,
        ethAccounts: vi.fn(),
        ethRequestAccounts: vi.fn(),
        hasEthereum: true,
        rwAccount: null as bigint | null,
    };
});

function emit(event: string, ...args: unknown[]) {
    for (const fn of mocks.listeners[event] ?? []) fn(...args);
}

vi.mock("@/react/context", () => {
    const { createContext } = require("react");
    return { AccountsCtx: createContext(null) };
});

vi.mock("@/blockchain", () => ({
    get ethereum() {
        return mocks.hasEthereum ? mocks.ethObj : undefined;
    },
    eth_accounts: (...args: unknown[]) => mocks.ethAccounts(...args),
    eth_requestAccounts: (...args: unknown[]) => mocks.ethRequestAccounts(...args),
}));

vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

vi.mock("@/type", () => ({
    Account: {
        of(addresses: string[]): bigint[] {
            return addresses.map((a: string) => BigInt(a));
        },
    },
}));

vi.mock("@/url", () => ({
    RWParams: {
        get account() { return mocks.rwAccount; },
        set account(v: bigint | null) { mocks.rwAccount = v; },
    },
}));

import { AccountsPro } from "./accounts-pro";
import { AccountsCtx } from "@/react/context";

function Consumer() {
    const ctx = useContext(AccountsCtx);
    if (!ctx) return <div data-testid="accounts">no-ctx</div>;
    const [accounts] = ctx;
    if (!accounts) return <div data-testid="accounts">null</div>;
    return <div data-testid="accounts">{accounts.map(String).join(",")}</div>;
}

let capturedConnect: (() => Promise<void>) | null = null;
function ConnectCapture() {
    const ctx = useContext(AccountsCtx);
    capturedConnect = ctx?.[1] ?? null;
    return null;
}

describe("AccountsPro", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        for (const key of Object.keys(mocks.listeners)) {
            delete mocks.listeners[key];
        }
        mocks.hasEthereum = true;
        mocks.rwAccount = null;
        mocks.ethAccounts.mockResolvedValue(["0x1", "0x2"]);
        mocks.ethRequestAccounts.mockResolvedValue(["0x1"]);
        capturedConnect = null;
    });
    afterEach(() => cleanup());

    it("should fetch accounts on mount", async () => {
        await act(async () => {
            render(<AccountsPro><Consumer /></AccountsPro>);
        });
        expect(screen.getByTestId("accounts").textContent).toBe("1,2");
        expect(mocks.ethAccounts).toHaveBeenCalled();
    });

    it("should set null when no accounts available", async () => {
        mocks.ethAccounts.mockResolvedValue(null);
        await act(async () => {
            render(<AccountsPro><Consumer /></AccountsPro>);
        });
        expect(screen.getByTestId("accounts").textContent).toBe("null");
    });

    it("should handle accountsChanged event", async () => {
        await act(async () => {
            render(<AccountsPro><Consumer /></AccountsPro>);
        });
        await act(async () => {
            emit("accountsChanged", ["0x3", "0x4"]);
        });
        expect(screen.getByTestId("accounts").textContent).toBe("3,4");
    });

    it("should rotate selected account to front", async () => {
        mocks.rwAccount = 2n;
        await act(async () => {
            render(<AccountsPro><Consumer /></AccountsPro>);
        });
        expect(screen.getByTestId("accounts").textContent).toBe("2,1");
    });

    it("should connect via eth_requestAccounts", async () => {
        await act(async () => {
            render(<AccountsPro><ConnectCapture /><Consumer /></AccountsPro>);
        });
        mocks.ethRequestAccounts.mockResolvedValue(["0x5"]);
        await act(async () => {
            await capturedConnect!();
        });
        expect(screen.getByTestId("accounts").textContent).toBe("5");
    });

    it("should update RWParams.account on accountsChanged", async () => {
        await act(async () => {
            render(<AccountsPro><Consumer /></AccountsPro>);
        });
        await act(async () => {
            emit("accountsChanged", ["0xa"]);
        });
        expect(mocks.rwAccount).toBe(10n);
    });

    it("should clean up accountsChanged listener on unmount", async () => {
        let result: ReturnType<typeof render>;
        await act(async () => {
            result = render(<AccountsPro><Consumer /></AccountsPro>);
        });
        expect(mocks.ethObj.on).toHaveBeenCalledWith(
            "accountsChanged", expect.any(Function),
        );
        result!.unmount();
        expect(mocks.ethObj.off).toHaveBeenCalledWith(
            "accountsChanged", expect.any(Function),
        );
    });
});

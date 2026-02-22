// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act, screen } from "@testing-library/react";
import { useContext } from "react";

const mocks = vi.hoisted(() => ({
    chainId: null as string | null,
    accounts: null as bigint[] | null,
}));

vi.mock("@/react/context", () => {
    const { createContext } = require("react");
    return { WalletStatusCtx: createContext(null) };
});

vi.mock("@/blockchain", () => ({
    ChainId: {
        AVALANCHE_MAINNET: "0xa86a",
        AVALANCHE_FUJI: "0xa869",
        NETWORK_OTHER: "0x0",
        isAvalanche(id: string) {
            return id === "0xa86a" || id === "0xa869";
        },
    },
    Status: {
        NoProvider: 0,
        WrongNetwork: 1,
        NoAccounts: 2,
        Ready: 3,
    },
}));

vi.mock("../hook", () => ({
    useWalletChainId: () => [mocks.chainId, vi.fn()],
    useWalletAccounts: () => [mocks.accounts, vi.fn()],
}));

import { WalletStatusPro } from "./wallet-status-pro";
import { WalletStatusCtx } from "@/react/context";
import { Status } from "@/blockchain";

function Consumer() {
    const ctx = useContext(WalletStatusCtx);
    if (!ctx) return <div data-testid="status">no-ctx</div>;
    return <div data-testid="status">{ctx[0] ?? "null"}</div>;
}

describe("WalletStatusPro", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.chainId = "0xa86a";
        mocks.accounts = [1n];
    });
    afterEach(() => cleanup());

    it("should derive Ready when chain is Avalanche and accounts exist", async () => {
        await act(async () => {
            render(<WalletStatusPro><Consumer /></WalletStatusPro>);
        });
        expect(screen.getByTestId("status").textContent)
            .toBe(String(Status.Ready));
    });

    it("should derive WrongNetwork when chain is non-Avalanche", async () => {
        mocks.chainId = "0x0";
        await act(async () => {
            render(<WalletStatusPro><Consumer /></WalletStatusPro>);
        });
        expect(screen.getByTestId("status").textContent)
            .toBe(String(Status.WrongNetwork));
    });

    it("should derive NoAccounts when chain exists but accounts null", async () => {
        mocks.accounts = null;
        await act(async () => {
            render(<WalletStatusPro><Consumer /></WalletStatusPro>);
        });
        expect(screen.getByTestId("status").textContent)
            .toBe(String(Status.NoAccounts));
    });

    it("should derive NoAccounts when chain exists but accounts empty", async () => {
        mocks.accounts = [];
        await act(async () => {
            render(<WalletStatusPro><Consumer /></WalletStatusPro>);
        });
        expect(screen.getByTestId("status").textContent)
            .toBe(String(Status.NoAccounts));
    });

    it("should derive NoProvider when chain_id is null", async () => {
        mocks.chainId = null;
        mocks.accounts = null;
        await act(async () => {
            render(<WalletStatusPro><Consumer /></WalletStatusPro>);
        });
        expect(screen.getByTestId("status").textContent)
            .toBe(String(Status.NoProvider));
    });
});

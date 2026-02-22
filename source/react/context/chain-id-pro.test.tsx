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
        ethChainId: vi.fn(),
        switchChain: vi.fn(),
        hasEthereum: true,
    };
});

function emit(event: string, ...args: unknown[]) {
    for (const fn of mocks.listeners[event] ?? []) fn(...args);
}

vi.mock("@/react/context", () => {
    const { createContext } = require("react");
    return { ChainIdCtx: createContext(null) };
});

vi.mock("@/blockchain", () => ({
    get ethereum() {
        return mocks.hasEthereum ? mocks.ethObj : undefined;
    },
    ChainId: {
        AVALANCHE_MAINNET: "0xa86a",
        AVALANCHE_FUJI: "0xa869",
        NETWORK_OTHER: "0x0",
        from(id: string | null) {
            if (id) switch (id) {
                case "0xa86a": return "0xa86a";
                case "0xa869": return "0xa869";
                default: return "0x0";
            }
            return null;
        },
        isAvalanche(id: string) {
            return id === "0xa86a" || id === "0xa869";
        },
    },
    eth_chainId: (...args: unknown[]) => mocks.ethChainId(...args),
    wallet_switchEthereumChain: (...args: unknown[]) => mocks.switchChain(...args),
}));

import { ChainIdPro } from "./chain-id-pro";
import { ChainIdCtx } from "@/react/context";
import { ChainId } from "@/blockchain";

function Consumer() {
    const ctx = useContext(ChainIdCtx);
    if (!ctx) return <div data-testid="chain-id">no-ctx</div>;
    return <div data-testid="chain-id">{ctx[0] ?? "null"}</div>;
}

let switchTo: ((id: ChainId | null) => Promise<void>) | null = null;
function SwitchCapture() {
    const ctx = useContext(ChainIdCtx);
    switchTo = ctx?.[1] ?? null;
    return null;
}

describe("ChainIdPro", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        for (const key of Object.keys(mocks.listeners)) {
            delete mocks.listeners[key];
        }
        mocks.hasEthereum = true;
        mocks.ethChainId.mockResolvedValue("0xa86a");
        mocks.switchChain.mockResolvedValue(null);
        switchTo = null;
    });
    afterEach(() => cleanup());

    it("should detect chain on mount", async () => {
        await act(async () => {
            render(<ChainIdPro><Consumer /></ChainIdPro>);
        });
        expect(screen.getByTestId("chain-id").textContent).toBe("0xa86a");
    });

    it("should set null when no ethereum provider", async () => {
        mocks.hasEthereum = false;
        await act(async () => {
            render(<ChainIdPro><Consumer /></ChainIdPro>);
        });
        expect(screen.getByTestId("chain-id").textContent).toBe("null");
        expect(mocks.ethChainId).not.toHaveBeenCalled();
    });

    it("should handle chainChanged event", async () => {
        await act(async () => {
            render(<ChainIdPro><Consumer /></ChainIdPro>);
        });
        await act(async () => {
            emit("chainChanged", "0xa869");
        });
        expect(screen.getByTestId("chain-id").textContent).toBe("0xa869");
    });

    it("should map unknown chain to NETWORK_OTHER", async () => {
        mocks.ethChainId.mockResolvedValue("0x1");
        await act(async () => {
            render(<ChainIdPro><Consumer /></ChainIdPro>);
        });
        expect(screen.getByTestId("chain-id").textContent).toBe("0x0");
    });

    it("should update chain via switch_to", async () => {
        await act(async () => {
            render(<ChainIdPro><SwitchCapture /><Consumer /></ChainIdPro>);
        });
        await act(async () => {
            await switchTo!(ChainId.AVALANCHE_FUJI);
        });
        expect(mocks.switchChain).toHaveBeenCalledWith(
            mocks.ethObj, { chainId: "0xa869" },
        );
        expect(screen.getByTestId("chain-id").textContent).toBe("0xa869");
    });

    it("should not update chain when switch fails", async () => {
        await act(async () => {
            render(<ChainIdPro><SwitchCapture /><Consumer /></ChainIdPro>);
        });
        mocks.switchChain.mockResolvedValue({ code: 1, message: "error" });
        await act(async () => {
            await switchTo!(ChainId.AVALANCHE_FUJI);
        });
        expect(screen.getByTestId("chain-id").textContent).toBe("0xa86a");
    });

    it("should clean up chainChanged listener on unmount", async () => {
        let result: ReturnType<typeof render>;
        await act(async () => {
            result = render(<ChainIdPro><Consumer /></ChainIdPro>);
        });
        expect(mocks.ethObj.on).toHaveBeenCalledWith(
            "chainChanged", expect.any(Function),
        );
        result!.unmount();
        expect(mocks.ethObj.off).toHaveBeenCalledWith(
            "chainChanged", expect.any(Function),
        );
    });
});

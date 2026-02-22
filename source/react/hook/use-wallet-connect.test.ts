// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockSwitchTo = vi.fn();
const mockConnect = vi.fn();
const mockOpen = vi.fn();

vi.mock("@/blockchain", () => ({
    Status: {
        NoProvider: 0,
        WrongNetwork: 1,
        NoAccounts: 2,
        Ready: 3,
    },
    ChainId: {
        AVALANCHE_MAINNET: "0xa86a",
    },
}));

let mockStatus = 3; // Ready
vi.mock("@/react/hook", () => ({
    useWalletChainId: () => [null, mockSwitchTo],
    useWalletAccount: () => [null, mockConnect],
    useWalletStatus: () => [mockStatus],
}));

vi.stubGlobal("open", mockOpen);

import { useWalletConnect } from "./use-wallet-connect";
import { Status } from "@/blockchain";

describe("useWalletConnect", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockStatus = Status.Ready;
    });

    it("should return [status, action] tuple", () => {
        const { result } = renderHook(() => useWalletConnect());
        const [status, action] = result.current;
        expect(status).toBe(Status.Ready);
        expect(typeof action).toBe("function");
    });

    it("should call switch_to for WrongNetwork", () => {
        mockStatus = Status.WrongNetwork;
        const { result } = renderHook(() => useWalletConnect());
        act(() => result.current[1]());
        expect(mockSwitchTo).toHaveBeenCalledWith("0xa86a");
    });

    it("should call connect for NoAccounts", () => {
        mockStatus = Status.NoAccounts;
        const { result } = renderHook(() => useWalletConnect());
        act(() => result.current[1]());
        expect(mockConnect).toHaveBeenCalled();
    });

    it("should be no-op for Ready", () => {
        mockStatus = Status.Ready;
        const { result } = renderHook(() => useWalletConnect());
        act(() => result.current[1]());
        expect(mockSwitchTo).not.toHaveBeenCalled();
        expect(mockConnect).not.toHaveBeenCalled();
        expect(mockOpen).not.toHaveBeenCalled();
    });

    it("should open metamask.io for NoProvider", () => {
        mockStatus = Status.NoProvider;
        const { result } = renderHook(() => useWalletConnect());
        act(() => result.current[1]());
        expect(mockOpen).toHaveBeenCalledWith("https://metamask.io", "_blank");
    });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { withActionGuard } from "./action-guard";

type MockState = {
    actions: string[];
    reset_actions: (action: string) => void;
};

describe("withActionGuard", () => {
    let resetSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        resetSpy = vi.fn();
    });

    function state(actions: string[]): MockState {
        return { actions, reset_actions: resetSpy as unknown as (action: string) => void };
    }

    it("should call handler when action not in prev or next", () => {
        const handler = vi.fn();
        const guard = withActionGuard("portfolio_amount", handler);
        guard(
            state([]) as never,
            state([]) as never,
        );
        expect(handler).toHaveBeenCalledOnce();
    });
    it("should reset and skip handler when action in next.actions", () => {
        const handler = vi.fn();
        const guard = withActionGuard("portfolio_amount", handler);
        guard(
            state(["portfolio_amount"]) as never,
            state([]) as never,
        );
        expect(handler).not.toHaveBeenCalled();
        expect(resetSpy).toHaveBeenCalledWith("portfolio_amount");
    });
    it("should skip handler when action was just removed", () => {
        const handler = vi.fn();
        const guard = withActionGuard("portfolio_amount", handler);
        guard(
            state([]) as never,
            state(["portfolio_amount"]) as never,
        );
        expect(handler).not.toHaveBeenCalled();
    });
    it("should call handler when action in prev but not the guarded one", () => {
        const handler = vi.fn();
        const guard = withActionGuard("portfolio_amount", handler);
        guard(
            state([]) as never,
            state(["portfolio_supply"]) as never,
        );
        expect(handler).toHaveBeenCalledOnce();
    });
});

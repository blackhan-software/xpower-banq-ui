// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { createContext, useContext, ReactNode } from "react";

vi.mock("@/react/context", () => {
    const pass = ({ children }: { children: ReactNode }) => children;
    return {
        ChainIdPro: pass,
        AccountsPro: pass,
        WalletStatusPro: pass,
    };
});

import { combine } from "./combine";
import { AppProvider } from "./index";

describe("combine", () => {
    afterEach(() => cleanup());

    it("should combine providers", () => {
        const Ctx1 = createContext("default1");
        const Ctx2 = createContext("default2");
        function Pro1({ children }: { children: ReactNode }) {
            return <Ctx1.Provider value="pro1">{children}</Ctx1.Provider>;
        }
        function Pro2({ children }: { children: ReactNode }) {
            return <Ctx2.Provider value="pro2">{children}</Ctx2.Provider>;
        }
        function Consumer() {
            return <div data-testid="values">
                {useContext(Ctx1)},{useContext(Ctx2)}
            </div>;
        }
        const Combined = combine(Pro1, Pro2);
        render(<Combined><Consumer /></Combined>);
        expect(screen.getByTestId("values").textContent).toBe("pro1,pro2");
    });

    it("should nest left-to-right (first is outermost)", () => {
        const Ctx = createContext("default");
        function Outer({ children }: { children: ReactNode }) {
            return <Ctx.Provider value="outer">{children}</Ctx.Provider>;
        }
        function Inner({ children }: { children: ReactNode }) {
            return <Ctx.Provider value="inner">{children}</Ctx.Provider>;
        }
        function Consumer() {
            return <div data-testid="value">{useContext(Ctx)}</div>;
        }
        const Combined = combine(Outer, Inner);
        render(<Combined><Consumer /></Combined>);
        expect(screen.getByTestId("value").textContent).toBe("inner");
    });

    it("should render children when no providers given", () => {
        const Combined = combine();
        render(<Combined><div data-testid="child">hello</div></Combined>);
        expect(screen.getByTestId("child").textContent).toBe("hello");
    });
});

describe("AppProvider", () => {
    afterEach(() => cleanup());

    it("should render children through composed providers", () => {
        render(<AppProvider><div data-testid="child">hello</div></AppProvider>);
        expect(screen.getByTestId("child").textContent).toBe("hello");
    });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { Pulsar } from "./pulsar";

afterEach(cleanup);

describe("Pulsar", () => {
    describe("children", () => {
        it("should render children when not pulsing", () => {
            render(<Pulsar>Click me</Pulsar>);
            expect(screen.getByText("Click me")).toBeDefined();
        });
        it("should hide children when pulsing", () => {
            render(<Pulsar pulse>Click me</Pulsar>);
            expect(screen.queryByText("Click me")).toBeNull();
        });
    });
    describe("spinners", () => {
        it("should render 3 spinners by default when pulsing", () => {
            const { container } = render(<Pulsar pulse />);
            const spinners = container.querySelectorAll(".spinner-grow");
            expect(spinners.length).toBe(3);
        });
        it("should render 1 spinner when n=1", () => {
            const { container } = render(<Pulsar pulse n={1} />);
            const spinners = container.querySelectorAll(".spinner-grow");
            expect(spinners.length).toBe(1);
        });
        it("should render 2 spinners when n=2", () => {
            const { container } = render(<Pulsar pulse n={2} />);
            const spinners = container.querySelectorAll(".spinner-grow");
            expect(spinners.length).toBe(2);
        });
        it("should render 3 spinners when n=3", () => {
            const { container } = render(<Pulsar pulse n={3} />);
            const spinners = container.querySelectorAll(".spinner-grow");
            expect(spinners.length).toBe(3);
        });
        it("should not render spinners when not pulsing", () => {
            const { container } = render(<Pulsar />);
            const spinners = container.querySelectorAll(".spinner-grow");
            expect(spinners.length).toBe(0);
        });
    });
    describe("CSS classes", () => {
        it("should include btn-pulsar class", () => {
            const { container } = render(<Pulsar />);
            expect(container.querySelector(".btn-pulsar")).toBeDefined();
        });
        it("should include pulse class when pulsing", () => {
            const { container } = render(<Pulsar pulse />);
            expect(container.querySelector(".pulse")).not.toBeNull();
        });
        it("should not include pulse class when not pulsing", () => {
            const { container } = render(<Pulsar />);
            expect(container.querySelector(".pulse")).toBeNull();
        });
        it("should merge string class", () => {
            const { container } = render(<Pulsar class="my-btn" />);
            expect(container.querySelector(".my-btn")).not.toBeNull();
        });
        it("should merge array class", () => {
            const { container } = render(
                <Pulsar class={["btn-a", "btn-b"]} />,
            );
            expect(container.querySelector(".btn-a")).not.toBeNull();
            expect(container.querySelector(".btn-b")).not.toBeNull();
        });
    });
    describe("button element", () => {
        it("should render a button", () => {
            render(<Pulsar />);
            expect(screen.getByRole("button")).toBeDefined();
        });
        it("should pass through button props", () => {
            render(<Pulsar type="submit" title="Go" />);
            const btn = screen.getByRole("button");
            expect(btn.getAttribute("type")).toBe("submit");
            expect(btn.getAttribute("data-bs-original-title")).toBe("Go");
        });
    });
});

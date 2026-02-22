// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Sector } from "./sector";

describe("Sector", () => {
    afterEach(() => cleanup());

    it("should render an SVG element", () => {
        const { container } = render(<Sector length={90} />);
        const svg = container.querySelector("svg");
        expect(svg).not.toBeNull();
    });

    it("should have correct default dimensions (radius=10)", () => {
        const { container } = render(<Sector length={90} />);
        const svg = container.querySelector("svg")!;
        expect(svg.getAttribute("height")).toBe("20");
        expect(svg.getAttribute("width")).toBe("20");
    });

    it("should respect custom radius", () => {
        const { container } = render(<Sector length={90} radius={20} />);
        const svg = container.querySelector("svg")!;
        expect(svg.getAttribute("height")).toBe("40");
        expect(svg.getAttribute("width")).toBe("40");
    });

    it("should render a path element", () => {
        const { container } = render(<Sector length={180} />);
        const path = container.querySelector("path");
        expect(path).not.toBeNull();
    });

    it("should set path d attribute after mount", () => {
        const { container } = render(<Sector length={90} />);
        const path = container.querySelector("path")!;
        expect(path.getAttribute("d")).not.toBeNull();
        expect(path.getAttribute("d")).toContain("M");
        expect(path.getAttribute("d")).toContain("A");
    });

    it("should handle near-360 degree arcs", () => {
        const { container } = render(<Sector length={360} />);
        const path = container.querySelector("path")!;
        expect(path.getAttribute("d")).toContain("A");
    });

    it("should apply custom stroke color", () => {
        const { container } = render(
            <Sector length={90} stroke={{ color: "red", width: 3 }} />
        );
        const path = container.querySelector("path")!;
        expect(path.style.stroke).toBe("red");
    });

    it("should apply custom stroke width", () => {
        const { container } = render(
            <Sector length={90} stroke={{ color: "blue", width: 5 }} />
        );
        const path = container.querySelector("path")!;
        expect(path.style.strokeWidth).toBe("5px");
    });

    it("should apply stroke dash array", () => {
        const { container } = render(
            <Sector length={90} stroke={{ color: "red", width: 2, dash: [5, 3] }} />
        );
        const path = container.querySelector("path")!;
        expect(path.style.strokeDasharray).toBe("5 3");
    });

    it("should have sector class", () => {
        const { container } = render(<Sector length={90} />);
        const svg = container.querySelector("svg")!;
        expect(svg.className.baseVal).toContain("sector");
    });

    it("should apply custom style", () => {
        const { container } = render(
            <Sector length={90} style={{ opacity: 0.5 }} />
        );
        const svg = container.querySelector("svg")!;
        expect(svg.style.opacity).toBe("0.5");
    });
});

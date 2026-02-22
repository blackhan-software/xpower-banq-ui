import { renderToStaticMarkup, ServerOptions } from "react-dom/server";

export function render(
    node: React.ReactNode, options?: ServerOptions
): string {
    return renderToStaticMarkup(node, options);
}
export default render;

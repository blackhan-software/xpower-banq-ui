// deno-lint-ignore-file jsx-void-dom-elements-no-children
import React from "react";
import { Classic, enhanced } from "./enhanced";
export { type Classic, enhanced };
export * from "./pulsar/pulsar";

export const A = React.forwardRef(<
    A extends Classic<React.AnchorHTMLAttributes<E>>,
    E extends HTMLAnchorElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <a
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </a>;
});
export const Button = React.forwardRef(<
    A extends Classic<React.ButtonHTMLAttributes<E>>,
    E extends HTMLButtonElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <button
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </button>;
});
export const Datalist = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLDataListElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <datalist
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </datalist>;
});
export const Div = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLDivElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <div
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </div>;
});
export const Footer = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <footer
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </footer>;
});
export const Form = React.forwardRef(<
    A extends Classic<React.FormHTMLAttributes<E>>,
    E extends HTMLFormElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <form
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </form>;
});
export const H1 = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLHeadingElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <h1
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </h1>;
});
export const H2 = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLHeadingElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <h2
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </h2>;
});
export const H3 = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLHeadingElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <h3
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </h3>;
});
export const H4 = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLHeadingElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <h4
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </h4>;
});
export const H5 = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLHeadingElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <h5
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </h5>;
});
export const Header = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <header
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </header>;
});
export const I = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <i
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </i>;
});
export const Input = React.forwardRef(<
    A extends Classic<React.InputHTMLAttributes<E>>,
    E extends HTMLInputElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <input
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </input>;
});
export const Img = React.forwardRef(<
    A extends Classic<React.ImgHTMLAttributes<E>>,
    E extends HTMLImageElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <img
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </img>;
});
export const Label = React.forwardRef(<
    A extends Classic<React.LabelHTMLAttributes<E>>,
    E extends HTMLLabelElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <label
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </label>;
});
export const Li = React.forwardRef(<
    A extends Classic<React.LiHTMLAttributes<E>>,
    E extends HTMLLIElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <li
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </li>;
});
export const Main = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <main
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </main>;
});
export const Nav = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <nav
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </nav>;
});
export const P = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLParagraphElement,
>(
    props: Classic<React.DetailedHTMLProps<A, E>>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <p
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </p>;
});
export const Select = React.forwardRef(<
    A extends Classic<React.SelectHTMLAttributes<E>>,
    E extends HTMLSelectElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <select
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </select>;
});
export const Option = React.forwardRef(<
    A extends Classic<React.OptionHTMLAttributes<E>>,
    E extends HTMLOptionElement,
>(
    props: React.DetailedHTMLProps<A, E>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <option
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </option>;
});
export const Span = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLSpanElement,
>(
    props: Classic<React.DetailedHTMLProps<A, E>>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <span
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </span>;
});
export const Ul = React.forwardRef(<
    A extends Classic<React.HTMLAttributes<E>>,
    E extends HTMLUListElement,
>(
    props: Classic<React.DetailedHTMLProps<A, E>>,
    ref: React.ForwardedRef<E>,
) => {
    if (ref === null) {
        ref = React.createRef<E>();
    }
    return <ul
        ref={ref} {...enhanced(props, ref)}
    >
        {props.children}
    </ul>;
});
A.displayName = "A";
Button.displayName = "Button";
Div.displayName = "Div";
Form.displayName = "Form";
H1.displayName = "H1";
H2.displayName = "H2";
H3.displayName = "H3";
H4.displayName = "H4";
H5.displayName = "H5";
I.displayName = "I";
Input.displayName = "Input";
Img.displayName = "Img";
Label.displayName = "Label";
Li.displayName = "Li";
Nav.displayName = "Nav";
P.displayName = "P";
Select.displayName = "Select";
Span.displayName = "Span";
Ul.displayName = "Ul";
